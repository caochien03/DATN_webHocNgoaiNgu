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
} from "lucide-react";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { shuffle } from "@/lib/shuffle";
import type { AttemptHandler, LearnCard } from "./types";

function normalize(value: string): string {
  return value.trim().normalize("NFC").replace(/\s+/g, " ").toLowerCase();
}

export function WriteGame({
  cards,
  onAttempt,
}: {
  cards: LearnCard[];
  onAttempt?: AttemptHandler;
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
      <div className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-lg md:p-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 to-transparent" />
        <div
          className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl shadow-primary/25"
          style={{ background: `linear-gradient(135deg, ${BRAND.yellow}, ${BRAND.blue})` }}
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
            ✓ Đúng: {score} từ
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
                background: `linear-gradient(135deg, ${BRAND.yellow}, ${BRAND.blue})`,
                boxShadow: `0 4px 14px 0 ${BRAND.yellow}35`,
              }}
            >
              Ôn lại {wrongCards.length} từ chưa đúng
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => restart()}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-secondary hover:border-primary/40"
          >
            <RotateCcw size={16} /> Luyện lại toàn bộ
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const progressPercent = Math.round(((index + 1) / queue.length) * 100);

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${BRAND.yellow}, ${BRAND.blue})` }}
          >
            <PenLine size={22} />
          </span>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Trí nhớ chủ động</span>
            <p className="text-lg font-extrabold text-foreground">Gõ Từ Theo Nghĩa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
            Từ {index + 1} / {queue.length}
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
            background: `linear-gradient(90deg, ${BRAND.yellow}, ${BRAND.blue})`,
          }}
        />
      </div>

      {/* Prompt Box */}
      <div
        className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-border p-7 text-center shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${BRAND.yellow}12 0%, var(--card) 60%, ${BRAND.blue}12 100%)`,
        }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-primary">
          <Sparkles size={12} /> Nghĩa tiếng Việt:
        </span>
        <p className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
          {current.backText}
        </p>
        {current.note ? (
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            💡 Gợi ý: {current.note}
          </p>
        ) : null}
      </div>

      {/* Form Input */}
      <form onSubmit={check} className="mt-6 flex flex-col gap-3.5">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nhập từ vựng chính xác
          </label>
          <input
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={result !== null}
            placeholder="Gõ từ vựng tại đây…"
            className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-center text-xl font-bold text-foreground outline-none shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-75"
          />
        </div>

        {result === null ? (
          <button
            type="submit"
            disabled={!answer.trim()}
            className="rounded-2xl py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
            }}
          >
            Kiểm tra đáp án (Enter)
          </button>
        ) : (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl p-4 shadow-sm"
            style={{
              backgroundColor: result === "correct" ? `${BRAND.green}15` : `${BRAND.red}15`,
              border: `1px solid ${result === "correct" ? BRAND.green : BRAND.red}35`,
            }}
          >
            <div className="flex items-center gap-2.5">
              {result === "correct" ? (
                <>
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    Chính xác! Bạn đã ghi nhớ rất chuẩn.
                  </span>
                </>
              ) : (
                <>
                  <CircleX size={20} className="text-red-500 shrink-0" />
                  <span className="font-bold text-red-500 text-sm">
                    Chưa đúng. Đáp án chính xác là:{" "}
                    <strong className="underline text-foreground">{current.frontText}</strong>
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={next}
              autoFocus
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                boxShadow: `0 4px 12px 0 ${BRAND.blue}35`,
              }}
            >
              <span>{index + 1 >= queue.length ? "Xem tổng kết" : "Từ tiếp theo"}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
