"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { shuffle } from "@/lib/shuffle";
import type { DeckWithStats, LessonRow, QuizSourceType, TopicRow } from "@/lib/types";

type SourceOption = { id: string; title: string };
type QA = { prompt: string; correct: string; options: string[] };

const QUESTION_COUNT = 10;

function buildQuestions(items: SourceOption[]): QA[] {
  if (items.length < 4) return [];
  const pool = shuffle(items).slice(0, Math.min(QUESTION_COUNT, items.length));
  return pool.map((item) => {
    const wrong = shuffle(items.filter((x) => x.id !== item.id))
      .slice(0, 3)
      .map((x) => x.title);
    return {
      prompt: item.id,
      correct: item.title,
      options: shuffle([item.title, ...wrong]),
    };
  });
}

function sourceLabel(sourceType: QuizSourceType): string {
  if (sourceType === "DECK") return "Bộ từ";
  if (sourceType === "TOPIC") return "Chủ đề";
  return "Bài học";
}

function TestsContent() {
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [sourceType, setSourceType] = useState<QuizSourceType>("DECK");
  const [sourceId, setSourceId] = useState<string>("");
  const [questions, setQuestions] = useState<QA[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSources = useCallback(async () => {
    setError(null);
    try {
      const [decksRes, topicsRes, lessonsRes] = await Promise.all([
        fetchWithAuth("/decks"),
        fetchWithAuth("/topics?language=ko"),
        fetchWithAuth("/lessons"),
      ]);
      if (!decksRes.ok || !topicsRes.ok || !lessonsRes.ok) {
        const firstFailed = [decksRes, topicsRes, lessonsRes].find((r) => !r.ok);
        setError(await parseApiError(firstFailed!));
        return;
      }
      const decksData = (await decksRes.json()) as { decks: DeckWithStats[] };
      setDecks(decksData.decks);
      setTopics((await topicsRes.json()) as TopicRow[]);
      setLessons((await lessonsRes.json()) as LessonRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được nguồn kiểm tra");
    }
  }, []);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  const options = useMemo<SourceOption[]>(() => {
    if (sourceType === "DECK") return decks.map((d) => ({ id: d.id, title: d.title }));
    if (sourceType === "TOPIC")
      return topics.map((t) => ({ id: t.id, title: t.title }));
    return lessons.map((l) => ({ id: l.id, title: l.title }));
  }, [decks, lessons, sourceType, topics]);

  useEffect(() => {
    if (options.length > 0 && !options.some((o) => o.id === sourceId)) {
      setSourceId(options[0].id);
    }
    if (options.length === 0) setSourceId("");
  }, [options, sourceId]);

  const current = questions[index] ?? null;

  async function startQuiz() {
    if (!sourceId) return;
    setError(null);
    setFinished(false);
    setCorrectCount(0);
    setIndex(0);
    setQuestions([]);
    try {
      if (sourceType === "DECK") {
        const res = await fetchWithAuth(`/decks/${sourceId}`);
        if (!res.ok) {
          setError(await parseApiError(res));
          return;
        }
        const deck = (await res.json()) as {
          cards: { id: string; frontText: string; backText: string }[];
        };
        setQuestions(
          buildQuestions(deck.cards.map((c) => ({ id: c.frontText, title: c.backText }))),
        );
        return;
      }
      if (sourceType === "TOPIC") {
        const res = await fetchWithAuth(`/topics/${sourceId}`);
        if (!res.ok) {
          setError(await parseApiError(res));
          return;
        }
        const topic = (await res.json()) as {
          words: { id: string; frontText: string; backText: string }[];
        };
        setQuestions(
          buildQuestions(
            topic.words.map((w) => ({ id: w.frontText, title: w.backText })),
          ),
        );
        return;
      }
      const res = await fetchWithAuth(`/lessons/${sourceId}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const lesson = (await res.json()) as {
        vocabulary: { id: string; frontText: string; backText: string }[];
      };
      setQuestions(
        buildQuestions(
          lesson.vocabulary.map((v) => ({ id: v.frontText, title: v.backText })),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tạo được bài kiểm tra");
    }
  }

  async function answer(option: string) {
    if (!current) return;
    const nextCorrect = correctCount + (option === current.correct ? 1 : 0);
    setCorrectCount(nextCorrect);
    if (index + 1 < questions.length) {
      setIndex((x) => x + 1);
      return;
    }
    setFinished(true);
    setSubmitting(true);
    try {
      const selected = options.find((o) => o.id === sourceId);
      const scorePercent =
        questions.length > 0 ? Math.round((nextCorrect / questions.length) * 100) : 0;
      const saveRes = await fetchWithAuth("/quiz-attempts", {
        method: "POST",
        body: JSON.stringify({
          sourceType,
          sourceId,
          sourceTitle: selected?.title ?? "N/A",
          totalQuestions: questions.length,
          correctAnswers: nextCorrect,
          scorePercent,
        }),
      });
      if (!saveRes.ok) {
        setError(await parseApiError(saveRes));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được kết quả");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Bài kiểm tra tổng hợp
        </h1>
        <Link
          href="/tests/history"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Lịch sử
        </Link>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Chọn nguồn dữ liệu và làm nhanh {QUESTION_COUNT} câu trắc nghiệm.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block text-zinc-600 dark:text-zinc-400">Nguồn</span>
            <select
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as QuizSourceType)}
            >
              <option value="DECK">Bộ từ</option>
              <option value="TOPIC">Chủ đề</option>
              <option value="LESSON">Bài học</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-zinc-600 dark:text-zinc-400">
              {sourceLabel(sourceType)}
            </span>
            <select
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
            >
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => void startQuiz()}
          disabled={!sourceId}
          className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Bắt đầu
        </button>
      </div>

      {questions.length > 0 && !finished && current ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500">
            Câu {index + 1}/{questions.length}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Nghĩa của: <span className="text-indigo-600 dark:text-indigo-300">{current.prompt}</span>
          </h2>
          <div className="mt-4 grid gap-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => void answer(opt)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                {opt}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {finished ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Hoàn thành bài kiểm tra
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Điểm của bạn:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {correctCount}/{questions.length} (
              {questions.length > 0
                ? Math.round((correctCount / questions.length) * 100)
                : 0}
              %)
            </span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void startQuiz()}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Làm lại
            </button>
            <Link
              href="/tests/history"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Xem lịch sử
            </Link>
          </div>
          {submitting ? (
            <p className="mt-2 text-xs text-zinc-500">Đang lưu kết quả...</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export default function TestsPage() {
  return (
    <AuthGate>
      <TestsContent />
    </AuthGate>
  );
}
