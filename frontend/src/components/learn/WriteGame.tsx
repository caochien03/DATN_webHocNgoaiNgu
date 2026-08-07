"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CircleX,
  Keyboard,
  PenLine,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import { motion } from "motion/react";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { shuffle } from "@/lib/shuffle";
import type { AttemptHandler, LearnCard } from "./types";

function normalize(value: string): string {
  return value.trim().normalize("NFC").replace(/\s+/g, " ").toLowerCase();
}

export function WriteGame({
  cards,
  onAttempt,
  onComplete,
}: {
  cards: LearnCard[];
  onAttempt?: AttemptHandler;
  onComplete?: (score: number, total: number) => void;
}) {
  const [queue, setQueue] = useState<LearnCard[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [score, setScore] = useState(0);
  const [wrongCards, setWrongCards] = useState<LearnCard[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cards.length > 0) {
      setQueue(shuffle(cards));
      setIndex(0);
      setAnswer("");
      setResult(null);
      setScore(0);
      setWrongCards([]);
      setDone(false);
    } else {
      setQueue([]);
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

  if (cards.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">Chưa có thẻ nào.</p>;
  }

  const current = queue[index];

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (result !== null || !current) return;
    const ok = normalize(answer) === normalize(current.frontText);
    setResult(ok ? "correct" : "wrong");
    if (ok) {
      setScore((s) => s + 1);
    } else {
      setWrongCards((w) =>
        w.some((c) => c.id === current.id) ? w : [...w, current],
      );
    }
    onAttempt?.(current.id, ok);
  }

  function next() {
    if (index + 1 >= queue.length) {
      setDone(true);
      onComplete?.(score, queue.length);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setResult(null);
  }

  function restart(target: LearnCard[] = cards) {
    setQueue(shuffle(target));
    setIndex(0);
    setAnswer("");
    setResult(null);
    setScore(0);
    setWrongCards([]);
    setDone(false);
  }

  if (done) {
    const pctScore =
      queue.length > 0 ? Math.round((score / queue.length) * 100) : 0;
    return (
      <div className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-md md:p-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
        <div
          className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
            boxShadow: `0 8px 24px 0 ${BRAND.blue}40`,
          }}
        >
          <Trophy size={32} />
        </div>
        <p className="relative mt-4 text-xs font-black uppercase tracking-[0.16em] text-primary">
          Kết quả luyện gõ
        </p>
        <p
          className="relative mt-1 text-5xl font-black tracking-tight sm:text-6xl"
          style={{ color: scoreColor(pctScore) }}
        >
          {pctScore}%
        </p>
        <div className="relative mt-3 flex items-center justify-center gap-3">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
            ✓ Đúng: {score} từ
          </span>
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-600 dark:text-red-400">
            ✗ Sai: {wrongCards.length} từ
          </span>
        </div>

        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          {wrongCards.length > 0 ? (
            <motion.button
              type="button"
              onClick={() => restart(wrongCards)}
              className="rounded-2xl px-6 py-3 text-xs font-black text-white shadow-md transition"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                boxShadow: `0 4px 16px 0 ${BRAND.blue}35`,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Luyện lại {wrongCards.length} từ chưa đúng
            </motion.button>
          ) : null}
          <motion.button
            type="button"
            onClick={() => restart()}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-xs font-black text-foreground shadow-xs transition hover:bg-secondary hover:border-primary/40"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={15} /> Luyện lại toàn bộ
          </motion.button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const progressPercent = Math.round(((index + 1) / queue.length) * 100);

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 16px 0 ${BRAND.blue}35`,
            }}
          >
            <PenLine size={22} />
          </span>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              Ghi nhớ chính tả
            </span>
            <p className="text-lg font-black text-foreground">Luyện Gõ Từ Vựng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs font-bold text-primary">
            Từ {index + 1} / {queue.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Prompt Meaning Card */}
      <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-secondary/40 via-card to-primary/5 p-6 text-center shadow-xs">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Gõ lại chính xác từ vựng tương ứng với nghĩa sau:
        </span>
        <p className="my-4 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {current.backText}
        </p>
        {current.note ? (
          <p className="inline-block rounded-xl border border-border bg-card/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
            💡 Gợi ý: {current.note}
          </p>
        ) : null}
      </div>

      {/* Input Form */}
      <form onSubmit={check} className="mt-6">
        <div className="relative">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={result !== null}
            placeholder="Nhập từ vựng tại đây..."
            autoFocus
            className={`w-full rounded-2xl border bg-card px-5 py-4 text-base sm:text-lg font-bold text-foreground transition-all outline-none ${
              result === null
                ? "border-border focus:border-primary focus:ring-4 focus:ring-primary/15"
                : result === "correct"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300 ring-2 ring-red-500/30"
            }`}
          />
          {result === null ? (
            <button
              type="submit"
              disabled={!answer.trim()}
              className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-white shadow-sm transition-all disabled:opacity-40"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              }}
            >
              <span>Kiểm tra</span>
              <Keyboard size={14} />
            </button>
          ) : null}
        </div>
      </form>

      {/* Result feedback */}
      {result !== null ? (
        <motion.div
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/60 p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            {result === "correct" ? (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <CheckCircle2 size={20} />
              </span>
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
                <CircleX size={20} />
              </span>
            )}
            <div>
              <p
                className={`text-xs font-black ${
                  result === "correct"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {result === "correct" ? "Chính xác 100%!" : "Chưa chính xác!"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-black text-foreground">
                  Đáp án chuẩn: {current.frontText}
                </span>
                <button
                  type="button"
                  onClick={() => speak(current.frontText)}
                  className="text-muted-foreground hover:text-primary transition"
                  title="Nghe phát âm"
                >
                  <Volume2 size={15} />
                </button>
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={next}
            className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-md whitespace-nowrap"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <span>{index + 1 >= queue.length ? "Xem tổng kết" : "Từ tiếp theo"}</span>
            <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      ) : null}
    </section>
  );
}
