"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Repeat2,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND } from "@/components/ui-kit/brand";
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
    <div className="mx-auto max-w-xl pb-10">
      <Link
        href={`/decks/${id}/learn`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Chọn chế độ khác
      </Link>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {deck && total === 0 ? (
        <div className="mt-6 rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 shadow-sm">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="mt-3 text-lg font-bold text-foreground">Không có từ vựng nào bị sai</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Tuyệt vời! Bạn đang nhớ rất tốt tất cả các từ trong bộ thẻ này.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href={`/decks/${id}/learn/quiz`}
              className="rounded-2xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-secondary hover:border-primary/40"
            >
              Luyện trắc nghiệm
            </Link>
            <Link
              href={`/decks/${id}/learn/write`}
              className="rounded-2xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-secondary hover:border-primary/40"
            >
              Luyện gõ từ
            </Link>
          </div>
        </div>
      ) : null}

      {deck && total > 0 && current ? (
        <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
          {/* Top Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                <AlertTriangle size={22} />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-500">Trọng tâm ôn luyện</span>
                <p className="text-lg font-extrabold text-foreground">Ôn Từ Hay Sai</p>
              </div>
            </div>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold text-amber-500">
              Còn {remaining}/{total} từ
            </span>
          </div>

          {/* Flashcard Box */}
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="mt-6 flex min-h-[260px] w-full flex-col items-center justify-center rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ boxShadow: "0 18px 40px -15px rgba(245, 158, 11, 0.2)" }}
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-amber-500">
              <Sparkles size={12} /> {flipped ? "Nghĩa tiếng Việt" : "Từ vựng gốc"}
            </span>
            <span className="text-3xl font-black text-foreground sm:text-4xl">
              {flipped ? current.backText : current.frontText}
            </span>
            {current.note && flipped ? (
              <p className="mt-3 rounded-xl bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                💡 {current.note}
              </p>
            ) : null}
            <span className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Repeat2 size={14} /> Nhấn để lật thẻ
            </span>
          </button>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="rounded-2xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-secondary hover:border-primary/40"
            >
              Lật thẻ
            </button>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={markStillWrong}
                className="flex items-center gap-2 rounded-2xl bg-red-500/15 border border-red-500/30 px-5 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white"
              >
                <XCircle size={17} /> Vẫn chưa thuộc
              </button>
              <button
                type="button"
                onClick={markRemember}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <CheckCircle2 size={17} /> Đã thuộc rồi
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {deck && total > 0 && queue.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 shadow-sm">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="mt-3 text-lg font-bold text-foreground">Đã duyệt xong lượt từ sai!</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Các từ đã thuộc sẽ được chuyển trạng thái ghi nhớ trong hệ thống.
          </p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
            }}
          >
            <RotateCcw size={16} /> Tải lại danh sách
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
