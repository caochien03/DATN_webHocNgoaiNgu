"use client";

import { useEffect, useState } from "react";
import { BRAND, GRADIENT, scoreColor } from "@/components/ui-kit/brand";
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
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
        <p
          className="text-4xl font-bold"
          style={{ color: scoreColor(pctScore) }}
        >
          {score}/{questions.length}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sai {wrongCards.length} từ.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {wrongCards.length > 0 ? (
            <button
              type="button"
              onClick={() => restart(wrongCards)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: GRADIENT }}
            >
              Ôn lại {wrongCards.length} từ sai
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => restart()}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Làm lại cả bộ
          </button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <>
      <p className="mt-4 text-sm text-muted-foreground">
        Câu {index + 1}/{questions.length} · Điểm: {score}
      </p>
      <div className="mt-3 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Nghĩa của
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {q.card.frontText}
        </p>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {q.options.map((opt) => {
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
                className="w-full rounded-xl border px-3 py-2.5 text-left text-sm text-foreground transition-colors disabled:cursor-default"
                style={
                  tint
                    ? { borderColor: tint, backgroundColor: `${tint}1a` }
                    : { borderColor: "var(--border)" }
                }
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>

      {picked !== null ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={nextQuestion}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            {index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp →"}
          </button>
        </div>
      ) : null}
    </>
  );
}
