"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleX,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { shuffle } from "@/lib/shuffle";
import type { AttemptHandler, LearnCard } from "./types";

type Question = {
  card: LearnCard;
  options: string[];
  correct: string;
};

const OPTION_COUNT = 4;

function buildQuestions(target: LearnCard[], pool: LearnCard[]): Question[] {
  if (target.length === 0) return [];
  return shuffle(target).map((card) => {
    const distractors = shuffle(pool.filter((c) => c.id !== card.id))
      .slice(0, OPTION_COUNT - 1)
      .map((c) => c.backText);
    const options = shuffle([card.backText, ...distractors]);
    return { card, options, correct: card.backText };
  });
}

export function QuizGame({
  cards,
  onAttempt,
}: {
  cards: LearnCard[];
  onAttempt?: AttemptHandler;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrongCards, setWrongCards] = useState<LearnCard[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cards.length >= OPTION_COUNT) {
      setQuestions(buildQuestions(cards, cards));
      setIndex(0);
      setPicked(null);
      setScore(0);
      setWrongCards([]);
      setDone(false);
    } else {
      setQuestions([]);
    }
  }, [cards]);

  if (cards.length < OPTION_COUNT) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Cần tối thiểu {OPTION_COUNT} thẻ để luyện trắc nghiệm.
      </p>
    );
  }

  const q = questions[index];

  function choose(opt: string) {
    if (picked !== null || !q) return;
    setPicked(opt);
    const isCorrect = opt === q.correct;
    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setWrongCards((w) =>
        w.some((c) => c.id === q.card.id) ? w : [...w, q.card],
      );
    }
    onAttempt?.(q.card.id, isCorrect);
  }

  function nextQuestion() {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  function restart(target: LearnCard[] = cards) {
    setQuestions(buildQuestions(target, cards));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setWrongCards([]);
    setDone(false);
  }

  if (done) {
    const pctScore =
      questions.length > 0
        ? Math.round((score / questions.length) * 100)
        : 0;
    return (
      <div className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-lg md:p-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 to-transparent" />
        <div
          className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl shadow-primary/25"
          style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})` }}
        >
          <Trophy size={32} />
        </div>
        <p className="relative mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Tổng kết kết quả
        </p>
        <p
          className="relative mt-1 text-5xl font-black tracking-tight sm:text-6xl"
          style={{ color: scoreColor(pctScore) }}
        >
          {pctScore}%
        </p>
        <div className="relative mt-3 flex items-center justify-center gap-3">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">
            ✓ Đúng: {score} câu
          </span>
          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-500">
            ✗ Sai: {wrongCards.length} từ
          </span>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
          {wrongCards.length > 0 ? (
            <button
              type="button"
              onClick={() => restart(wrongCards)}
              className="rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
                boxShadow: `0 4px 14px 0 ${BRAND.purple}35`,
              }}
            >
              Ôn lại {wrongCards.length} từ sai
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => restart()}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-secondary hover:border-primary/40"
          >
            <RotateCcw size={16} /> Làm lại cả bộ
          </button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const progressPercent = Math.round(((index + 1) / questions.length) * 100);

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})` }}
          >
            <HelpCircle size={22} />
          </span>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Phản xạ nhanh</span>
            <p className="text-lg font-extrabold text-foreground">Trắc Nghiệm 4 Lựa Chọn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
            Câu {index + 1} / {questions.length}
          </span>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-500">
            {score} điểm
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary/80">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.blue})`,
          }}
        />
      </div>

      {/* Question Prompt Box */}
      <div
        className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-border p-7 text-center shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${BRAND.purple}12 0%, var(--card) 60%, ${BRAND.blue}12 100%)`,
        }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-primary">
          <Sparkles size={12} /> Chọn nghĩa chính xác của từ:
        </span>
        <p className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
          {q.card.frontText}
        </p>
        {q.card.note ? (
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            💡 Gợi ý: {q.card.note}
          </p>
        ) : null}
      </div>

      {/* 4 Options Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((opt, optionIndex) => {
          const isCorrect = opt === q.correct;
          const isPicked = picked === opt;
          const revealed = picked !== null;
          const letters = ["A", "B", "C", "D"];

          let style = {};
          let className =
            "group relative flex min-h-[72px] w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-default ";

          if (revealed) {
            if (isCorrect) {
              className += "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10 scale-[1.01]";
            } else if (isPicked) {
              className += "border-red-500 bg-red-500/15 text-red-500 shadow-md shadow-red-500/10";
            } else {
              className += "border-border bg-card/60 opacity-60";
            }
          } else {
            className += "border-border bg-card hover:-translate-y-1 hover:border-primary/50 hover:bg-secondary/60 hover:shadow-md";
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={revealed}
              onClick={() => choose(opt)}
              className={className}
              style={style}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors ${
                  revealed && isCorrect
                    ? "bg-emerald-500 text-white"
                    : revealed && isPicked
                    ? "bg-red-500 text-white"
                    : "bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-white"
                }`}
              >
                {revealed && isCorrect ? (
                  <Check size={18} />
                ) : revealed && isPicked ? (
                  <CircleX size={18} />
                ) : (
                  letters[optionIndex]
                )}
              </span>
              <span className="font-bold text-foreground leading-snug">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Answer Feedback Banner & Next Button */}
      {picked !== null ? (
        <div
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-4 shadow-sm"
          style={{
            backgroundColor: picked === q.correct ? `${BRAND.green}15` : `${BRAND.red}15`,
            border: `1px solid ${picked === q.correct ? BRAND.green : BRAND.red}35`,
          }}
        >
          <div className="flex items-center gap-2.5">
            {picked === q.correct ? (
              <>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <Check size={16} />
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  Chính xác! Bạn ghi nhớ rất tốt.
                </span>
              </>
            ) : (
              <>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white">
                  <CircleX size={16} />
                </span>
                <span className="font-bold text-red-500 text-sm">
                  Chưa đúng. Đáp án chính xác là: <strong className="underline text-foreground">{q.correct}</strong>
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={nextQuestion}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
              boxShadow: `0 4px 12px 0 ${BRAND.purple}35`,
            }}
          >
            <span>{index + 1 >= questions.length ? "Xem tổng kết" : "Câu tiếp theo"}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
