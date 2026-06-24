"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import {
  backLinkClass,
  dangerButtonClass,
  ghostButtonClass,
  successButtonClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
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
      <Link href={`/decks/${id}/learn`} className={backLinkClass}>
        ← Chọn chế độ khác
      </Link>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      ) : null}

      {deck && total === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có thẻ nào đang ở trạng thái sai. Hoàn thành quiz hoặc bài viết
            để đánh dấu các thẻ cần ôn.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link href={`/decks/${id}/learn/quiz`} className={ghostButtonClass}>
              Mở trắc nghiệm
            </Link>
            <Link href={`/decks/${id}/learn/write`} className={ghostButtonClass}>
              Mở viết
            </Link>
          </div>
        </div>
      ) : null}

      {deck && total > 0 && current ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Còn {remaining}/{total} từ sai
          </p>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="mt-3 flex min-h-[180px] w-full items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center text-xl font-medium text-amber-200 shadow-sm transition hover:bg-amber-500/15"
          >
            {flipped ? current.backText : current.frontText}
          </button>
          {current.note ? (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {current.note}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className={ghostButtonClass}
            >
              Lật thẻ
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={markStillWrong}
                className={dangerButtonClass}
              >
                Vẫn chưa thuộc
              </button>
              <button
                type="button"
                onClick={markRemember}
                className={successButtonClass}
              >
                Đã nhớ
              </button>
            </div>
          </div>
        </>
      ) : null}

      {deck && total > 0 && queue.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Đã duyệt hết lượt ôn này.</p>
          <GradientButton
            type="button"
            onClick={() => void reload()}
            className="mt-3"
          >
            Tải lại danh sách từ sai
          </GradientButton>
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
