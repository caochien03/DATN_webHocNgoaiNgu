"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Play, Plus, Trash2 } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
import {
  backLinkClass,
  errorBannerClass,
  inputClass,
  listItemClass,
  sectionTitleClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { DeckDetail } from "@/lib/types";

function DeckDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/decks/${id}`);
      if (res.status === 404) {
        setError("Không tìm thấy bộ.");
        setDeck(null);
        return;
      }
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setDeck((await res.json()) as DeckDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`/decks/${id}/cards`, {
        method: "POST",
        body: JSON.stringify({
          frontText: front.trim(),
          backText: back.trim(),
          ...(note.trim() && { note: note.trim() }),
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setFront("");
      setBack("");
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thêm được thẻ");
    } finally {
      setAdding(false);
    }
  }

  async function removeCard(cardId: string) {
    if (!window.confirm("Xóa thẻ này?")) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được");
    }
  }

  async function removeDeck() {
    if (!window.confirm("Xóa cả bộ và mọi thẻ trong bộ?")) return;
    try {
      const res = await fetchWithAuth(`/decks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      router.push("/decks");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được bộ");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/decks" className={backLinkClass}>
        ← Danh sách bộ
      </Link>

      {error ? <p className={errorBannerClass}>{error}</p> : null}

      {deck === null && !error ? (
        <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p>
      ) : null}

      {deck ? (
        <>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{deck.title}</h1>
              {deck.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {deck.description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {deck.cards.length > 0 ? (
                <Link
                  href={`/decks/${id}/learn`}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: GRADIENT }}
                >
                  <Play size={14} /> Học
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void removeDeck()}
                className="text-sm hover:underline"
                style={{ color: BRAND.red }}
              >
                Xóa bộ
              </button>
            </div>
          </div>

          <section className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h2 className={`mb-3 ${sectionTitleClass}`}>Thêm thẻ</h2>
            <form onSubmit={addCard} className="flex flex-col gap-3">
              <input
                required
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Mặt trước (VD: từ tiếng Hàn)"
                className={inputClass}
              />
              <input
                required
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Mặt sau (VD: nghĩa tiếng Việt)"
                className={inputClass}
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                className={inputClass}
              />
              <GradientButton
                type="submit"
                disabled={adding}
                className="flex w-full items-center justify-center gap-1.5 py-2.5"
              >
                <Plus size={14} /> {adding ? "Đang thêm…" : "Thêm thẻ"}
              </GradientButton>
            </form>
          </section>

          <section className="mt-8">
            <h2 className={`mb-3 ${sectionTitleClass}`}>
              Danh sách thẻ ({deck.cards.length})
            </h2>
            {deck.cards.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có thẻ nào.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {deck.cards.map((c) => (
                  <div
                    key={c.id}
                    className={`flex justify-between gap-2 ${listItemClass}`}
                  >
                    <div className="min-w-0 text-sm">
                      <p className="font-semibold text-foreground">{c.frontText}</p>
                      <p className="text-muted-foreground">{c.backText}</p>
                      {c.note ? (
                        <p className="mt-1 text-xs text-muted-foreground/70">{c.note}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeCard(c.id)}
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-red-400"
                      aria-label="Xóa thẻ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default function DeckDetailPage() {
  return (
    <AuthGate>
      <DeckDetailContent />
    </AuthGate>
  );
}
