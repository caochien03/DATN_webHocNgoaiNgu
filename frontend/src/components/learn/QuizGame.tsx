"use client";

import { useEffect, useState } from "react";
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
      <p className="mt-6 text-sm text-zinc-500">
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
    return (
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Hoàn thành</p>
        <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {score} / {questions.length}
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sai {wrongCards.length} từ.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {wrongCards.length > 0 ? (
            <button
              type="button"
              onClick={() => restart(wrongCards)}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Ôn lại {wrongCards.length} từ sai
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => restart()}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
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
      <p className="mt-4 text-sm text-zinc-500">
        Câu {index + 1}/{questions.length} · Điểm: {score}
      </p>
      <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Nghĩa của
        </p>
        <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {q.card.frontText}
        </p>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {q.options.map((opt) => {
          const isCorrect = opt === q.correct;
          const isPicked = picked === opt;
          const revealed = picked !== null;
          const color = !revealed
            ? "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            : isCorrect
              ? "border-green-500 bg-green-50 dark:bg-green-950/50"
              : isPicked
                ? "border-red-500 bg-red-50 dark:bg-red-950/50"
                : "border-zinc-300 dark:border-zinc-700";
          return (
            <li key={opt}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => choose(opt)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm text-zinc-900 dark:text-zinc-100 disabled:cursor-default ${color}`}
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
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp →"}
          </button>
        </div>
      ) : null}
    </>
  );
}
