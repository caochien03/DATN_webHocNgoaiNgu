"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Layers3, Repeat2, Shuffle, Sparkles } from "lucide-react";
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

  return (
    <section className="mt-5 overflow-hidden rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_45px_-38px_rgba(249,115,22,0.8)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers3 size={19} />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Flashcard</p>
            <p className="text-xs text-muted-foreground">Lật thẻ để ghi nhớ từ vựng</p>
          </div>
        </div>
        <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {index + 1}/{order.length}
        </span>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / order.length) * 100}%`, background: GRADIENT_DIAGONAL }}
        />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        className={`relative mt-5 flex min-h-[285px] w-full overflow-hidden rounded-[24px] border p-8 text-center transition-all duration-300 hover:-translate-y-0.5 ${
          flipped
            ? "border-primary/40 bg-primary/[0.065] shadow-lg shadow-primary/10"
            : "border-border bg-background hover:border-primary/35"
        }`}
      >
        <span
          className="absolute -right-10 -top-12 h-36 w-36 rounded-full opacity-70 blur-2xl"
          style={{ backgroundColor: flipped ? `${BRAND.yellow}35` : `${BRAND.blue}22` }}
        />
        <span className="relative flex w-full flex-col items-center justify-center">
          <span className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles size={13} style={{ color: BRAND.yellow }} /> {flipped ? "Mặt sau" : "Mặt trước"}
          </span>
          <span className="max-w-[90%] text-3xl font-bold leading-tight text-foreground">
            {flipped ? current.backText : current.frontText}
          </span>
          <span className="mt-6 text-sm text-muted-foreground">
            {flipped ? "Nhấn để xem lại từ" : "Nhấn vào thẻ để xem nghĩa"}
          </span>
        </span>
      </button>
      {current.note ? (
        <p className="mt-3 rounded-xl bg-secondary/70 px-4 py-2 text-center text-xs text-muted-foreground">
          {current.note}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Thẻ trước"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Repeat2 size={16} /> Lật thẻ
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-primary/20"
            style={{ background: GRADIENT_DIAGONAL }}
            aria-label="Thẻ tiếp theo"
          >
            <ArrowRight size={18} />
          </button>
        </div>
        <button
          type="button"
          onClick={reshuffle}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Shuffle size={15} /> Trộn lại
        </button>
      </div>
    </section>
  );
}
