"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { recordAttempt } from "@/lib/api-fetch";
import { shuffle } from "@/lib/shuffle";
import type { CardRow } from "@/lib/types";
import { useDeck } from "@/lib/use-deck";

function WeakContent() {
  const params = useParams();
  const id = params.id as string;
  const { deck, loading, error, reload } = useDeck(id);

  const [queue, setQueue] = useState<CardRow[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const weakCards = useMemo(
    () => (deck?.cards ?? []).filter((c) => c.lastResult === false),
    [deck],
  );

  useEffect(() => {
    setQueue(shuffle(weakCards));
    setIndex(0);
    setFlipped(false);
  }, [weakCards]);

  const current = queue[index];

  function advance() {
    setFlipped(false);
    if (index + 1 >= queue.length) {
      setQueue([]);
      return;
    }
    setIndex((i) => i + 1);
  }

  function markRemember() {
    if (!current) return;
    recordAttempt(current.id, true);
    setQueue((q) => q.filter((c) => c.id !== current.id));
    setIndex(0);
    setFlipped(false);
  }

  function markStillWrong() {
    if (!current) return;
    recordAttempt(current.id, false);
    advance();
  }

  const total = weakCards.length;
  const remaining = queue.length;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href={`/decks/${id}/learn`}
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Chọn chế độ khác
      </Link>

      {loading ? <p className="mt-6 text-sm text-zinc-500">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {deck && total === 0 ? (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">
            Chưa có thẻ nào đang ở trạng thái sai. Hoàn thành quiz hoặc bài viết
            để đánh dấu các thẻ cần ôn.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link
              href={`/decks/${id}/learn/quiz`}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Mở trắc nghiệm
            </Link>
            <Link
              href={`/decks/${id}/learn/write`}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Mở viết
            </Link>
          </div>
        </div>
      ) : null}

      {deck && total > 0 && current ? (
        <>
          <p className="mt-4 text-sm text-zinc-500">
            Còn {remaining}/{total} từ sai
          </p>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="mt-3 flex min-h-[180px] w-full items-center justify-center rounded-xl border border-amber-300 bg-amber-50 p-6 text-center text-xl font-medium text-amber-900 shadow-sm hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/40"
          >
            {flipped ? current.backText : current.frontText}
          </button>
          {current.note ? (
            <p className="mt-2 text-center text-xs text-zinc-500">
              {current.note}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Lật thẻ
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={markStillWrong}
                className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                Vẫn chưa thuộc
              </button>
              <button
                type="button"
                onClick={markRemember}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Đã nhớ
              </button>
            </div>
          </div>
        </>
      ) : null}

      {deck && total > 0 && queue.length === 0 ? (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Đã duyệt hết lượt ôn này.</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Tải lại danh sách từ sai
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function WeakPage() {
  return (
    <AuthGate>
      <WeakContent />
    </AuthGate>
  );
}
