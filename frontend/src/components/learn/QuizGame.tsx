"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, CircleX, HelpCircle, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { BRAND, GRADIENT_DIAGONAL, scoreColor } from "@/components/ui-kit/brand";
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
    const pctScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="relative mt-5 overflow-hidden rounded-[28px] border border-border bg-card p-8 text-center shadow-[0_18px_45px_-38px_rgba(249,115,22,0.8)]">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/25" style={{ background: GRADIENT_DIAGONAL }}>
          <Trophy size={26} />
        </div>
        <p className="relative mt-4 text-sm font-semibold text-muted-foreground">Hoàn thành lượt luyện</p>
        <p className="relative mt-1 text-5xl font-bold tracking-tight" style={{ color: scoreColor(pctScore) }}>
          {pctScore}%
        </p>
        <p className="relative mt-2 text-sm text-muted-foreground">
          Đúng {score}/{questions.length} câu · Sai {wrongCards.length} từ
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {wrongCards.length > 0 ? (
            <button
              type="button"
              onClick={() => restart(wrongCards)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20"
              style={{ background: GRADIENT_DIAGONAL }}
            >
              Ôn lại {wrongCards.length} từ sai
            </button>
          ) : null}
          <button
              type="button"
              onClick={() => restart()}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw size={15} /> Làm lại cả bộ
            </button>
          </div>
        </div>
    );
  }

  if (!q) return null;

  return (
    <section className="mt-5 rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_45px_-38px_rgba(249,115,22,0.8)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><HelpCircle size={19} /></span>
          <div>
            <p className="text-sm font-bold text-foreground">Trắc nghiệm</p>
            <p className="text-xs text-muted-foreground">Chọn nghĩa phù hợp nhất</p>
          </div>
        </div>
        <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">Điểm {score}</span>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((index + 1) / questions.length) * 100}%`, background: GRADIENT_DIAGONAL }} />
      </div>

      <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/[0.045] px-6 py-7 text-center">
        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles size={13} style={{ color: BRAND.yellow }} /> Nghĩa của từ
        </p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{q.card.frontText}</p>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3">
        {q.options.map((opt, optionIndex) => {
          const isCorrect = opt === q.correct;
          const isPicked = picked === opt;
          const revealed = picked !== null;
          const tint = revealed
            ? isCorrect
              ? BRAND.green
              : isPicked
                ? BRAND.red
                : null
            : null;
          return (
            <li key={opt}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => choose(opt)}
                className={`flex min-h-[72px] w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm transition-all disabled:cursor-default ${
                  !revealed ? "bg-background hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5" : ""
                }`}
                style={
                  tint
                    ? { borderColor: tint, backgroundColor: `${tint}1a` }
                    : { borderColor: "var(--border)" }
                }
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground"
                  style={tint ? { color: tint, backgroundColor: `${tint}18` } : undefined}
                >
                  {revealed && isCorrect ? <Check size={16} /> : revealed && isPicked ? <CircleX size={16} /> : String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="font-medium text-foreground">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {picked !== null ? (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-secondary/70 px-4 py-3">
          <p className="text-sm font-medium" style={{ color: picked === q.correct ? BRAND.green : BRAND.red }}>
            {picked === q.correct ? "Chính xác, rất tốt!" : `Đáp án đúng: ${q.correct}`}
          </p>
          <button
            type="button"
            onClick={nextQuestion}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20"
            style={{ background: GRADIENT_DIAGONAL }}
          >
            {index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp"} <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
