"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, GRADIENT, scoreColor } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import { learningLanguageLabel } from "@/lib/learning-language";
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
  const { languageCode } = useLearningLanguage();
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
        fetchWithAuth(appendLanguageQuery("/decks", languageCode)),
        fetchWithAuth(appendLanguageQuery("/topics", languageCode)),
        fetchWithAuth(appendLanguageQuery("/lessons", languageCode)),
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
  }, [languageCode]);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  useEffect(() => {
    setQuestions([]);
    setFinished(false);
    setCorrectCount(0);
    setIndex(0);
  }, [languageCode]);

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
          languageCode,
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

  const finalPercent =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const selectClass =
    "w-full rounded-xl border border-border bg-secondary px-3 py-2 text-foreground outline-none focus:border-primary/50";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Bài kiểm tra tổng hợp"
        sub={`Chọn nguồn và làm nhanh ${QUESTION_COUNT} câu — ${learningLanguageLabel(languageCode)}`}
        action={
          <Link
            href="/tests/history"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <History size={14} /> Lịch sử
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-muted-foreground">Nguồn</span>
            <select
              className={selectClass}
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as QuizSourceType)}
            >
              <option value="DECK">Bộ thẻ</option>
              <option value="TOPIC">Chủ đề</option>
              <option value="LESSON">Bài học</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium text-muted-foreground">
              {sourceLabel(sourceType)}
            </span>
            <select
              className={selectClass}
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
          className="mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: GRADIENT }}
        >
          Bắt đầu
        </button>
      </div>

      {questions.length > 0 && !finished && current ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">
            Câu {index + 1}/{questions.length}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Nghĩa của:{" "}
            <span style={{ color: BRAND.cyan }}>{current.prompt}</span>
          </h2>
          <div className="mt-4 grid gap-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => void answer(opt)}
                className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40"
              >
                {opt}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {finished ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
          <p
            className="text-4xl font-bold"
            style={{ color: scoreColor(finalPercent) }}
          >
            {finalPercent}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {correctCount}/{questions.length} câu đúng
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => void startQuiz()}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Làm lại
            </button>
            <Link
              href="/tests/history"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: GRADIENT }}
            >
              Xem lịch sử
            </Link>
          </div>
          {submitting ? (
            <p className="mt-2 text-xs text-muted-foreground">Đang lưu kết quả...</p>
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
