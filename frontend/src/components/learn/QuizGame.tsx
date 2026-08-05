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
  Volume2,
} from "lucide-react";
import { motion } from "motion/react";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { shuffle } from "@/lib/shuffle";
import type { AttemptHandler, LearnCard } from "./types";

type Question = {
  card: LearnCard;
  options: string[];
  correct: string;
};

const OPTION_COUNT = 4;
const OPTION_LETTERS = ["A", "B", "C", "D"];

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

  function speak(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

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
      <div className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-md md:p-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
        <div
          className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
            boxShadow: `0 8px 24px 0 ${BRAND.purple}40`,
          }}
        >
          <Trophy size={32} />
        </div>
        <p className="relative mt-4 text-xs font-black uppercase tracking-[0.16em] text-primary">
          Kết quả trắc nghiệm
        </p>
        <p
          className="relative mt-1 text-5xl font-black tracking-tight sm:text-6xl"
          style={{ color: scoreColor(pctScore) }}
        >
          {pctScore}%
        </p>
        <div className="relative mt-3 flex items-center justify-center gap-3">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
            ✓ Đúng: {score} câu
          </span>
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-600 dark:text-red-400">
            ✗ Sai: {wrongCards.length} câu
          </span>
        </div>

        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          {wrongCards.length > 0 ? (
            <motion.button
              type="button"
              onClick={() => restart(wrongCards)}
              className="rounded-2xl px-6 py-3 text-xs font-black text-white shadow-md transition"
              style={{
                background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
                boxShadow: `0 4px 16px 0 ${BRAND.purple}35`,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Ôn lại {wrongCards.length} từ sai
            </motion.button>
          ) : null}
          <motion.button
            type="button"
            onClick={() => restart()}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-xs font-black text-foreground shadow-xs transition hover:bg-secondary hover:border-primary/40"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={15} /> Luyện lại từ đầu
          </motion.button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const progressPercent = Math.round(((index + 1) / questions.length) * 100);

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
              boxShadow: `0 4px 16px 0 ${BRAND.purple}35`,
            }}
          >
            <HelpCircle size={22} />
          </span>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              Kiểm tra nhanh
            </span>
            <p className="text-lg font-black text-foreground">Trắc Nghiệm 4 Lựa Chọn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs font-bold text-primary">
            Câu {index + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.blue})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Question Prompt Card */}
      <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-secondary/40 via-card to-primary/5 p-6 text-center shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Nghĩa tiếng Việt của từ này là gì?
          </span>
          <button
            type="button"
            onClick={() => speak(q.card.frontText)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary"
            title="Phát âm"
          >
            <Volume2 size={15} />
          </button>
        </div>
        <p className="my-5 text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          {q.card.frontText}
        </p>
      </div>

      {/* 4 Options Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const letter = OPTION_LETTERS[i] ?? `${i + 1}`;
          const isPicked = picked === opt;
          const isCorrect = opt === q.correct;
          const showAnswer = picked !== null;

          let btnStyle = "border-border bg-card hover:border-primary/50 hover:bg-secondary/60";
          let letterStyle = "bg-secondary text-muted-foreground";

          if (showAnswer) {
            if (isCorrect) {
              btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30";
              letterStyle = "bg-emerald-500 text-white";
            } else if (isPicked && !isCorrect) {
              btnStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 ring-2 ring-red-500/30";
              letterStyle = "bg-red-500 text-white";
            } else {
              btnStyle = "border-border bg-card opacity-50";
            }
          }

          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => choose(opt)}
              disabled={picked !== null}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left font-bold transition-all ${btnStyle}`}
              whileHover={picked === null ? { scale: 1.01, y: -1 } : {}}
              whileTap={picked === null ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors ${letterStyle}`}
                >
                  {letter}
                </span>
                <span className="text-sm text-foreground">{opt}</span>
              </div>
              {showAnswer && isCorrect ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={14} />
                </span>
              ) : null}
              {showAnswer && isPicked && !isCorrect ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                  <CircleX size={14} />
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {/* Next Question Footer */}
      {picked !== null ? (
        <motion.div
          className="mt-6 flex items-center justify-between border-t border-border pt-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {picked === q.correct ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check size={16} /> Chính xác! Tuyệt vời.
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <CircleX size={16} /> Chưa đúng. Đáp án: {q.correct}
              </span>
            )}
          </div>
          <motion.button
            type="button"
            onClick={nextQuestion}
            className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <span>{index + 1 >= questions.length ? "Xem tổng kết" : "Câu tiếp"}</span>
            <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      ) : null}
    </section>
  );
}
