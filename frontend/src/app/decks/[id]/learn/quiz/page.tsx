"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { QuizGame } from "@/components/learn/QuizGame";
import { recordAttempt } from "@/lib/api-fetch";
import { useDeck } from "@/lib/use-deck";

function DeckQuiz() {
  const params = useParams();
  const id = params.id as string;
  const { deck, loading, error } = useDeck(id);

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

      {deck ? <QuizGame cards={deck.cards} onAttempt={recordAttempt} /> : null}
    </div>
  );
}

export default function QuizPage() {
  return (
    <AuthGate>
      <DeckQuiz />
    </AuthGate>
  );
}
