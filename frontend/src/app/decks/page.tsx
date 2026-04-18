"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

type DeckRow = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  _count: { cards: number };
};

function DecksContent() {
  const [decks, setDecks] = useState<DeckRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/decks");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setDecks((await res.json()) as DeckRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Bộ từ của tôi
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tạo bộ mới hoặc mở một bộ để thêm thẻ (từ / nghĩa).
          </p>
        </div>
        <Link
          href="/decks/new"
          className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          + Bộ mới
        </Link>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {decks === null ? (
        <p className="text-sm text-zinc-500">Đang tải…</p>
      ) : decks.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Chưa có bộ nào.{" "}
          <Link href="/decks/new" className="font-medium underline">
            Tạo bộ đầu tiên
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {decks.map((d) => (
            <li key={d.id}>
              <Link
                href={`/decks/${d.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {d.title}
                </span>
                <span className="text-sm text-zinc-500">
                  {d._count.cards} thẻ
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DecksPage() {
  return (
    <AuthGate>
      <DecksContent />
    </AuthGate>
  );
}
