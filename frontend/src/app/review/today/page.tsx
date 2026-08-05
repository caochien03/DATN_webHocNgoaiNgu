"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
import { Bar, PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError, recordAttempt } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
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
  const { languageCode } = useLearningLanguage();
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
      const res = await fetchWithAuth(
        `${appendLanguageQuery("/review/today", languageCode)}&limit=20`,
      );
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
  }, [languageCode]);

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
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Ôn tập SRS"
        sub="Nhìn nghĩa, tự gõ lại từ vựng — hệ thống tự chấm để cập nhật lịch ôn"
        action={
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw size={14} /> Tải lại
          </button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Tiến độ phiên</span>
          <span className="font-mono">
            {done}/{total} ({progress}%)
          </span>
        </div>
        <Bar done={done} total={total || 1} color={BRAND.cyan} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : null}

      {!loading && !current ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Không còn thẻ đến hạn. Bạn đã hoàn thành lượt ôn hôm nay.
          </p>
          <Link
            href="/decks"
            className="mt-4 inline-block rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            Quay lại bộ thẻ
          </Link>
        </div>
      ) : null}

      {current ? (
        <section>
          <p className="mb-3 text-sm text-muted-foreground">
            Còn {remaining} thẻ · Bộ: {current.deckTitle} · Streak: {current.streak}
          </p>
          <div className="flex min-h-[180px] w-full items-center justify-center rounded-3xl border border-border bg-card p-8 text-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Nghĩa
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {current.backText}
              </p>
            </div>
          </div>
          {current.note ? (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {current.note}
            </p>
          ) : null}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Viết từ vựng
            </label>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={result !== null}
              placeholder="Nhập đáp án…"
              className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
            />
          </div>

          {result ? (
            <p
              className="mt-3 rounded-lg px-3 py-2 text-sm font-medium"
              style={{
                color: result === "correct" ? BRAND.green : BRAND.red,
                backgroundColor: `${result === "correct" ? BRAND.green : BRAND.red}14`,
              }}
            >
              {result === "correct"
                ? "Đúng rồi!"
                : `Chưa đúng. Đáp án đúng: ${current.frontText}`}
            </p>
          ) : null}

          <div className="mt-4 flex justify-end">
            {result === null ? (
              <button
                type="button"
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: GRADIENT }}
              >
                Chấm điểm
              </button>
            ) : (
              <button
                type="button"
                onClick={nextCard}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: GRADIENT }}
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
