"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

type CardRow = {
  id: string;
  frontText: string;
  backText: string;
  note: string | null;
  sortOrder: number;
};

type DeckDetail = {
  id: string;
  title: string;
  description: string | null;
  cards: CardRow[];
};

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
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href="/decks"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Danh sách bộ
      </Link>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {deck === null && !error ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
      ) : null}

      {deck ? (
        <>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {deck.title}
              </h1>
              {deck.description ? (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {deck.description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {deck.cards.length > 0 ? (
                <Link
                  href={`/decks/${id}/learn`}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Học
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void removeDeck()}
                className="text-sm text-red-600 hover:underline dark:text-red-400"
              >
                Xóa bộ
              </button>
            </div>
          </div>

          <section className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Thêm thẻ
            </h2>
            <form onSubmit={addCard} className="mt-3 flex flex-col gap-3">
              <input
                required
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Mặt trước (VD: từ tiếng Hàn)"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <input
                required
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Mặt sau (VD: nghĩa tiếng Việt)"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={adding}
                className="rounded-md bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {adding ? "Đang thêm…" : "Thêm thẻ"}
              </button>
            </form>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Danh sách thẻ ({deck.cards.length})
            </h2>
            {deck.cards.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">Chưa có thẻ nào.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {deck.cards.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0 text-sm">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {c.frontText}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {c.backText}
                        </p>
                        {c.note ? (
                          <p className="mt-1 text-xs text-zinc-500">{c.note}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeCard(c.id)}
                        className="shrink-0 text-xs text-red-600 hover:underline dark:text-red-400"
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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
