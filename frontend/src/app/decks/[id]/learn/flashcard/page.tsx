"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { backLinkClass, errorClass } from "@/components/ui-kit/form-styles";
import { FlashcardGame } from "@/components/learn/FlashcardGame";
import { useDeck } from "@/lib/use-deck";

function DeckFlashcard() {
  const params = useParams();
  const id = params.id as string;
  const { deck, loading, error } = useDeck(id);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href={`/decks/${id}/learn`}
        className={backLinkClass}
      >
        ← Chọn chế độ khác
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className={errorClass}>{error}</p>
      ) : null}

      {deck ? <FlashcardGame cards={deck.cards} /> : null}
    </div>
  );
}

export default function FlashcardPage() {
  return (
    <AuthGate>
      <DeckFlashcard />
    </AuthGate>
  );
}
