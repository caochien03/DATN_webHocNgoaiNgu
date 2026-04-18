"use client";

import { useEffect, useState } from "react";
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
    return <p className="mt-6 text-sm text-zinc-500">Chưa có thẻ nào.</p>;
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
      <p className="mt-4 text-sm text-zinc-500">
        Thẻ {index + 1}/{order.length}
      </p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-3 flex min-h-[200px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 text-center text-xl font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        {flipped ? current.backText : current.frontText}
      </button>
      {current.note ? (
        <p className="mt-2 text-center text-xs text-zinc-500">{current.note}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            ← Trước
          </button>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Lật thẻ
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Sau →
          </button>
        </div>
        <button
          type="button"
          onClick={reshuffle}
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Trộn lại
        </button>
      </div>
    </>
  );
}
