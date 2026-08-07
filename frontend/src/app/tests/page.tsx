"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, CircleX, HelpCircle, History, RotateCcw, Trophy } from "lucide-react";
import { motion } from "motion/react";
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
const OPTION_LETTERS = ["A", "B", "C", "D"];

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
  if (sourceType === "DECK") return "Bộ thẻ";
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
  const [picked, setPicked] = useState<string | null>(null);
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
    setPicked(null);
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
    setPicked(null);
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

  function handleSelectOption(opt: string) {
    if (!current || picked !== null) return;
    setPicked(opt);
    const isCorrect = opt === current.correct;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }
  }

  async function handleNext() {
    if (!current || picked === null) return;
    
    if (index + 1 < questions.length) {
      setIndex((x) => x + 1);
      setPicked(null);
      return;
    }

    setFinished(true);
    setSubmitting(true);
    try {
      const selected = options.find((o) => o.id === sourceId);
      const scorePercent =
        questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      const saveRes = await fetchWithAuth("/quiz-attempts", {
        method: "POST",
        body: JSON.stringify({
          sourceType,
          sourceId,
          sourceTitle: selected?.title ?? "N/A",
          languageCode,
          totalQuestions: questions.length,
          correctAnswers: correctCount,
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
    "w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Bài kiểm tra tổng hợp"
        sub={`Chọn nguồn và làm nhanh ${QUESTION_COUNT} câu — ${learningLanguageLabel(languageCode)}`}
        action={
          <Link
            href="/tests/history"
            className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-xs transition hover:border-primary/40 hover:text-foreground"
          >
            <History size={15} /> Lịch sử làm bài
          </Link>
        }
      />

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </p>
      ) : null}

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-2 block font-bold text-foreground">Nguồn kiểm tra</span>
            <select
              className={selectClass}
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as QuizSourceType)}
            >
              <option value="DECK">Bộ thẻ cá nhân</option>
              <option value="TOPIC">Chủ đề từ vựng</option>
              <option value="LESSON">Bài học ngữ pháp</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-2 block font-bold text-foreground">
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

        <motion.button
          type="button"
          onClick={() => void startQuiz()}
          disabled={!sourceId}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50"
          style={{ background: GRADIENT }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <HelpCircle size={16} />
          Bắt đầu kiểm tra
        </motion.button>
      </div>

      {questions.length > 0 && !finished && current ? (
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-md md:p-8">
          {/* Header tiến độ */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
                {index + 1}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                Câu {index + 1} / {questions.length}
              </span>
            </div>
            <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-xs font-bold text-foreground">
              Đúng: {correctCount}/{index + (picked !== null ? 1 : 0)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})` }}
              initial={{ width: 0 }}
              animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Thẻ câu hỏi */}
          <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nghĩa của từ vựng:
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight" style={{ color: BRAND.cyan }}>
              {current.prompt}
            </p>
          </div>

          {/* 4 Lựa chọn đáp án với hiệu ứng Active / Đúng / Sai */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {current.options.map((opt, i) => {
              const letter = OPTION_LETTERS[i] ?? `${i + 1}`;
              const isPicked = picked === opt;
              const isCorrect = opt === current.correct;
              const showAnswer = picked !== null;

              let btnClass = "border-border bg-card hover:border-primary/50 hover:bg-secondary/40";
              let letterClass = "bg-secondary text-muted-foreground";

              if (showAnswer) {
                if (isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30";
                  letterClass = "bg-emerald-500 text-white";
                } else if (isPicked && !isCorrect) {
                  btnClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 ring-2 ring-red-500/30";
                  letterClass = "bg-red-500 text-white";
                } else {
                  btnClass = "border-border bg-card opacity-50";
                }
              }

              return (
                <motion.button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  disabled={picked !== null}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left font-bold transition-all ${btnClass}`}
                  whileHover={picked === null ? { scale: 1.01, y: -1 } : {}}
                  whileTap={picked === null ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors ${letterClass}`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm text-foreground">{opt}</span>
                  </div>
                  {showAnswer && isCorrect ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check size={14} />
                    </span>
                  ) : null}
                  {showAnswer && isPicked && !isCorrect ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                      <CircleX size={14} />
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>

          {/* Footer nút chuyển câu */}
          {picked !== null ? (
            <motion.div
              className="mt-6 flex items-center justify-between border-t border-border pt-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                {picked === current.correct ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check size={16} /> Chính xác! Rất tốt.
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <CircleX size={16} /> Chưa đúng. Đáp án: {current.correct}
                  </span>
                )}
              </div>
              <motion.button
                type="button"
                onClick={() => void handleNext()}
                className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                  boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span>{index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"}</span>
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          ) : null}
        </section>
      ) : null}

      {finished ? (
        <motion.section
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-lg md:p-10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 8px 24px 0 ${BRAND.blue}40`,
            }}
          >
            <Trophy size={32} />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-primary">
            Kết quả kiểm tra
          </p>
          <p
            className="mt-1 text-5xl font-black tracking-tight sm:text-6xl"
            style={{ color: scoreColor(finalPercent) }}
          >
            {finalPercent}%
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
              ✓ Đúng: {correctCount}/{questions.length}
            </span>
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-black text-red-600 dark:text-red-400">
              ✗ Sai: {questions.length - correctCount}/{questions.length}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              type="button"
              onClick={() => void startQuiz()}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-xs font-black text-foreground shadow-xs transition hover:border-primary/40 hover:bg-secondary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw size={15} /> Kiểm tra lại
            </motion.button>
            <Link
              href="/tests/history"
              className="flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                boxShadow: `0 4px 16px 0 ${BRAND.blue}35`,
              }}
            >
              <History size={15} /> Xem lịch sử
            </Link>
          </div>
          {submitting ? (
            <p className="mt-4 text-xs text-muted-foreground">Đang lưu kết quả vào hệ thống…</p>
          ) : null}
        </motion.section>
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
