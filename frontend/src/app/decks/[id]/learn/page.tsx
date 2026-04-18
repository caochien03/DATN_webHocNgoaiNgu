"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { useDeck } from "@/lib/use-deck";

const MODES: {
  slug: string;
  title: string;
  description: string;
  minCards: number;
}[] = [
  {
    slug: "flashcard",
    title: "Flashcard",
    description: "Lật thẻ: mặt trước ↔ mặt sau.",
    minCards: 1,
  },
  {
    slug: "quiz",
    title: "Trắc nghiệm",
    description: "Chọn nghĩa đúng trong 4 phương án.",
    minCards: 4,
  },
  {
    slug: "match",
    title: "Ghép cặp",
    description: "Nối từ với nghĩa.",
    minCards: 2,
  },
  {
    slug: "write",
    title: "Nhìn nghĩa, viết từ",
    description: "Gõ mặt trước khi thấy mặt sau.",
    minCards: 1,
  },
];

function LearnContent() {
  const params = useParams();
  const id = params.id as string;
  const { deck, error, loading } = useDeck(id);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href={`/decks/${id}`}
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Quay lại bộ
      </Link>

      {loading ? <p className="mt-6 text-sm text-zinc-500">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {deck ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Học bộ “{deck.title}”
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Bộ có {deck.cards.length} thẻ · Từ sai gần đây:{" "}
            {deck.cards.filter((c) => c.lastResult === false).length}
          </p>

          {deck.cards.some((c) => c.lastResult === false) ? (
            <Link
              href={`/decks/${id}/learn/weak`}
              className="mt-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/40"
            >
              <div>
                <p className="font-medium">Ôn từ sai</p>
                <p className="mt-0.5 text-sm">
                  Tập trung các thẻ gần nhất trả lời sai.
                </p>
              </div>
              <span className="text-amber-700 dark:text-amber-300">›</span>
            </Link>
          ) : null}

          <ul className="mt-4 flex flex-col gap-3">
            {MODES.map((m) => {
              const enough = deck.cards.length >= m.minCards;
              return (
                <li key={m.slug}>
                  {enough ? (
                    <Link
                      href={`/decks/${id}/learn/${m.slug}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {m.title}
                        </p>
                        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                          {m.description}
                        </p>
                      </div>
                      <span className="self-center text-zinc-400">›</span>
                    </Link>
                  ) : (
                    <div className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-zinc-200 px-4 py-3 opacity-70 dark:border-zinc-800">
                      <div>
                        <p className="font-medium text-zinc-700 dark:text-zinc-300">
                          {m.title}
                        </p>
                        <p className="mt-0.5 text-sm text-zinc-500">
                          Cần tối thiểu {m.minCards} thẻ để chơi.
                        </p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export default function LearnMenuPage() {
  return (
    <AuthGate>
      <LearnContent />
    </AuthGate>
  );
}
