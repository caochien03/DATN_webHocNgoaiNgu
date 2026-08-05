"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Keyboard,
  Layers3,
  Repeat2,
  Shuffle,
  Sparkles,
  Volume2,
} from "lucide-react";
import { BRAND, GRADIENT_DIAGONAL } from "@/components/ui-kit/brand";
import { shuffle } from "@/lib/shuffle";
import type { LearnCard } from "./types";

export function FlashcardGame({ cards }: { cards: LearnCard[] }) {
  const [order, setOrder] = useState<LearnCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (cards.length > 0) {
      setOrder(shuffle(cards));
      setIndex(0);
      setFlipped(false);
    } else {
      setOrder([]);
    }
  }, [cards]);

  const current = order[index];

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setFlipped(false);
        setIndex((i) => (i + 1) % order.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFlipped(false);
        setIndex((i) => (i - 1 + order.length) % order.length);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [order.length]);

  if (order.length === 0 || !current) {
    return <p className="mt-6 text-sm text-muted-foreground">Chưa có thẻ nào.</p>;
  }

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % order.length);
  }
  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + order.length) % order.length);
  }
  function reshuffle() {
    setOrder(shuffle(cards));
    setIndex(0);
    setFlipped(false);
  }

  const progressPercent = Math.round(((index + 1) / order.length) * 100);

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})` }}
          >
            <Layers3 size={22} />
          </span>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Luyện phản xạ</span>
            <p className="text-lg font-extrabold text-foreground">Flashcard Lật Thẻ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
            Thẻ {index + 1} / {order.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary/80">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})`,
          }}
        />
      </div>

      {/* Flashcard 3D interactive Box */}
      <div className="perspective-1000 mt-6">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          className={`group relative flex min-h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border p-8 text-center transition-all duration-300 hover:-translate-y-1 ${
            flipped
              ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-cyan-500/10 shadow-xl shadow-emerald-500/10"
              : "border-primary/30 bg-gradient-to-br from-primary/10 via-card to-amber-500/10 shadow-xl shadow-primary/10"
          }`}
          style={{
            boxShadow: flipped
              ? "0 20px 40px -15px rgba(16, 185, 129, 0.2)"
              : "0 20px 40px -15px rgba(249, 115, 22, 0.2)",
          }}
        >
          {/* Top Pill Tag */}
          <div className="mb-4">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider shadow-sm"
              style={{
                background: flipped ? "rgba(16, 185, 129, 0.18)" : "rgba(249, 115, 22, 0.18)",
                color: flipped ? BRAND.green : BRAND.blue,
              }}
            >
              <Sparkles size={13} />
              {flipped ? "Mặt sau: Ý nghĩa tiếng Việt" : "Mặt trước: Từ vựng gốc"}
            </span>
          </div>

          {/* Main Text */}
          <div className="my-auto flex flex-col items-center justify-center max-w-xl">
            <span className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {flipped ? current.backText : current.frontText}
            </span>
            {current.note && flipped ? (
              <p className="mt-4 rounded-xl bg-background/80 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
                💡 {current.note}
              </p>
            ) : null}
          </div>

          {/* Bottom Flip Hint */}
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            <Repeat2 size={15} />
            <span>Nhấn vào thẻ hoặc phím cách (Space) để lật</span>
          </div>
        </button>
      </div>

      {/* Control Buttons Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-secondary hover:text-foreground hover:scale-105"
            aria-label="Thẻ trước"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-secondary hover:scale-105"
          >
            <Repeat2 size={18} className="text-primary" /> Lật thẻ
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-bold text-white shadow-md transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
            }}
            aria-label="Thẻ tiếp theo"
          >
            <span>Tiếp theo</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={reshuffle}
            className="flex items-center gap-1.5 font-bold transition hover:text-primary"
          >
            <Shuffle size={14} /> Trộn ngẫu nhiên
          </button>
          <span className="hidden md:inline-flex items-center gap-1 opacity-70">
            <Keyboard size={13} /> Phím ← / →
          </span>
        </div>
      </div>
    </section>
  );
}
