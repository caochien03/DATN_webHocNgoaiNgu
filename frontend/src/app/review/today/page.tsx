"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError, recordAttempt } from "@/lib/api-fetch";
import { shuffle } from "@/lib/shuffle";

type ReviewCard = {
  id: string;
  deckId: string;
  deckTitle: string;
  frontText: string;
  backText: string;
  note: string | null;
  streak: number;
  nextReviewAt: string | null;
};

function ReviewTodayContent() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [done, setDone] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/review/today?limit=20");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setCards(shuffle((await res.json()) as ReviewCard[]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách ôn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const current = cards[0] ?? null;
  const remaining = cards.length;
  const total = done + remaining;

  const progress = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((done / total) * 100);
  }, [done, total]);

  function normalize(text: string) {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function submitAnswer() {
    if (!current) return;
    const isCorrect = normalize(answer) === normalize(current.frontText);
    setResult(isCorrect ? "correct" : "wrong");
    recordAttempt(current.id, isCorrect);
  }

  function nextCard() {
    if (!current) return;
    setCards((prev) => prev.slice(1));
    setDone((d) => d + 1);
    setAnswer("");
    setResult(null);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Ôn hôm nay
        </h1>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Tải lại
        </button>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Nhìn nghĩa, tự gõ lại từ vựng. Hệ thống tự chấm đúng/sai để cập nhật SRS.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Tiến độ phiên</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {loading ? <p className="mt-6 text-sm text-zinc-500">Đang tải…</p> : null}

      {!loading && !current ? (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Không còn thẻ đến hạn. Bạn đã hoàn thành lượt ôn hôm nay.
          </p>
          <Link
            href="/decks"
            className="mt-3 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Quay lại bộ từ
          </Link>
        </div>
      ) : null}

      {current ? (
        <section className="mt-6">
          <p className="text-sm text-zinc-500">
            Còn {remaining} thẻ · Bộ: {current.deckTitle} · Streak hiện tại:{" "}
            {current.streak}
          </p>
          <div className="mt-3 flex min-h-[160px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Nghĩa</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {current.backText}
              </p>
            </div>
          </div>
          {current.note ? (
            <p className="mt-2 text-center text-xs text-zinc-500">{current.note}</p>
          ) : null}
          <div className="mt-4">
            <label className="block text-sm text-zinc-600 dark:text-zinc-400">
              Viết từ vựng
            </label>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={result !== null}
              placeholder="Nhập đáp án..."
              className="mt-1 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
          </div>

          {result ? (
            <p
              className={`mt-3 text-sm ${
                result === "correct"
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {result === "correct"
                ? "Đúng rồi!"
                : `Chưa đúng. Đáp án đúng: ${current.frontText}`}
            </p>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            {result === null ? (
              <button
                type="button"
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Chấm điểm
              </button>
            ) : (
              <button
                type="button"
                onClick={nextCard}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Thẻ tiếp theo
              </button>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function ReviewTodayPage() {
  return (
    <AuthGate>
      <ReviewTodayContent />
    </AuthGate>
  );
}
