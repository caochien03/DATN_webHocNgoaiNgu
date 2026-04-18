"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { recordAttempt } from "@/lib/api-fetch";
import { shuffle } from "@/lib/shuffle";
import type { CardRow } from "@/lib/types";
import { useDeck } from "@/lib/use-deck";

function normalize(value: string): string {
  return value.trim().normalize("NFC").replace(/\s+/g, " ").toLowerCase();
}

function WriteContent() {
  const params = useParams();
  const id = params.id as string;
  const { deck, loading, error } = useDeck(id);

  const [queue, setQueue] = useState<CardRow[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [score, setScore] = useState(0);
  const [wrongCards, setWrongCards] = useState<CardRow[]>([]);
  const [done, setDone] = useState(false);

  const cards = useMemo(() => deck?.cards ?? [], [deck]);

  useEffect(() => {
    if (cards.length > 0) {
      setQueue(shuffle(cards));
      setIndex(0);
      setAnswer("");
      setResult(null);
      setScore(0);
      setWrongCards([]);
      setDone(false);
    }
  }, [cards]);

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
    recordAttempt(current.id, ok);
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

  function restart(target: CardRow[] = cards) {
    setQueue(shuffle(target));
    setIndex(0);
    setAnswer("");
    setResult(null);
    setScore(0);
    setWrongCards([]);
    setDone(false);
  }

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

      {deck && cards.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Bộ chưa có thẻ nào.</p>
      ) : null}

      {deck && queue.length > 0 && !done && current ? (
        <>
          <p className="mt-4 text-sm text-zinc-500">
            Thẻ {index + 1}/{queue.length} · Điểm: {score}
          </p>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Viết từ cho nghĩa sau
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {current.backText}
            </p>
            {current.note ? (
              <p className="mt-1 text-xs text-zinc-500">{current.note}</p>
            ) : null}
          </div>

          <form onSubmit={check} className="mt-4 flex flex-col gap-3">
            <input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={result !== null}
              placeholder="Nhập đáp án…"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:opacity-70 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {result === null ? (
              <button
                type="submit"
                className="rounded-md bg-zinc-900 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Kiểm tra
              </button>
            ) : (
              <div
                className={`rounded-md border px-3 py-2 text-sm ${
                  result === "correct"
                    ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-200"
                    : "border-red-500 bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                }`}
              >
                {result === "correct" ? (
                  <span>Chính xác.</span>
                ) : (
                  <span>
                    Sai. Đáp án:{" "}
                    <strong className="font-semibold">
                      {current.frontText}
                    </strong>
                  </span>
                )}
              </div>
            )}
            {result !== null ? (
              <button
                type="button"
                onClick={next}
                className="rounded-md bg-zinc-900 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {index + 1 >= queue.length ? "Xem kết quả" : "Thẻ tiếp →"}
              </button>
            ) : null}
          </form>
        </>
      ) : null}

      {done ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Hoàn thành</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {score} / {queue.length}
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
      ) : null}
    </div>
  );
}

export default function WritePage() {
  return (
    <AuthGate>
      <WriteContent />
    </AuthGate>
  );
}
