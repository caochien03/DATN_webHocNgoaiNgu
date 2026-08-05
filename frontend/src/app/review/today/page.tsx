"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flame, Layers, RotateCcw, Sparkles, XCircle } from "lucide-react";
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
    <div className="mx-auto max-w-xl pb-10">
      <PageHeader
        title="Ôn tập SRS ngắt quãng"
        sub="Nhìn nghĩa, tự gõ lại từ vựng — thuật toán sẽ tự động tối ưu lịch ôn"
        action={
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
          >
            <RotateCcw size={14} /> Tải lại
          </button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <div className="mb-6 rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">Tiến độ lượt ôn</span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
            {done}/{total} ({progress}%)
          </span>
        </div>
        <Bar done={done} total={total || 1} color={BRAND.blue} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải thẻ ôn…</p>
      ) : null}

      {!loading && !current ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Hoàn thành lượt ôn hôm nay!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Không còn thẻ nào đến hạn cần ôn. Hãy quay lại vào ngày mai nhé.
          </p>
          <Link
            href="/decks"
            className="mt-5 inline-block rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
            }}
          >
            Xem danh sách bộ thẻ
          </Link>
        </div>
      ) : null}

      {current ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-foreground">
              <Layers size={13} className="text-primary" /> {current.deckTitle}
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <Flame size={13} /> Chuỗi nhớ: {current.streak}
            </span>
          </div>

          <div
            className="relative flex min-h-[200px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}10 0%, transparent 60%, ${BRAND.cyan}10 100%)`,
            }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Nghĩa tiếng Việt
            </span>
            <p className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
              {current.backText}
            </p>
            {current.note ? (
              <p className="mt-3 rounded-xl bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                💡 {current.note}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Gõ từ vựng tương ứng
            </label>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={result !== null}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (result === null) submitAnswer();
                  else nextCard();
                }
              }}
              placeholder="Nhập từ vựng…"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-base font-semibold text-foreground outline-none shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
            />
          </div>

          {result ? (
            <div
              className="flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold shadow-sm"
              style={{
                color: result === "correct" ? BRAND.green : BRAND.red,
                backgroundColor: `${result === "correct" ? BRAND.green : BRAND.red}14`,
                border: `1px solid ${result === "correct" ? BRAND.green : BRAND.red}35`,
              }}
            >
              {result === "correct" ? (
                <>
                  <CheckCircle2 size={20} className="shrink-0" />
                  <span>Chính xác! Bạn đã ghi nhớ từ này rất tốt.</span>
                </>
              ) : (
                <>
                  <XCircle size={20} className="shrink-0" />
                  <span>
                    Chưa đúng. Đáp án chính xác là: <strong className="underline">{current.frontText}</strong>
                  </span>
                </>
              )}
            </div>
          ) : null}

          <div className="flex justify-end pt-2">
            {result === null ? (
              <button
                type="button"
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                  boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
                }}
              >
                Kiểm tra đáp án
              </button>
            ) : (
              <button
                type="button"
                onClick={nextCard}
                className="rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                  boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
                }}
              >
                Thẻ tiếp theo →
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
