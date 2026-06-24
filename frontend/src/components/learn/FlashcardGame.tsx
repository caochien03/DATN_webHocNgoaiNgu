"use client";

import { useEffect, useState } from "react";
import { GRADIENT } from "@/components/ui-kit/brand";
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
    <>
      <p className="mt-4 text-sm text-muted-foreground">
        Thẻ {index + 1}/{order.length}
      </p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-3 flex min-h-[200px] w-full items-center justify-center rounded-3xl border border-border bg-card p-6 text-center text-2xl font-semibold text-foreground transition-colors hover:border-primary/40"
      >
        {flipped ? current.backText : current.frontText}
      </button>
      {current.note ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">{current.note}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Trước
          </button>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Lật thẻ
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            Sau →
          </button>
        </div>
        <button
          type="button"
          onClick={reshuffle}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Trộn lại
        </button>
      </div>
    </>
  );
}
