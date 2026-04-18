"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { shuffle } from "@/lib/shuffle";
import type { CardRow } from "@/lib/types";
import { useDeck } from "@/lib/use-deck";

type Side = "front" | "back";
type Tile = {
  key: string;
  cardId: string;
  side: Side;
  text: string;
};

const ROUND_SIZE = 6;

function buildRound(cards: CardRow[]): { tiles: Tile[]; pairs: number } {
  const pool = shuffle(cards).slice(0, Math.min(ROUND_SIZE, cards.length));
  const tiles: Tile[] = [];
  for (const c of pool) {
    tiles.push({
      key: `${c.id}:front`,
      cardId: c.id,
      side: "front",
      text: c.frontText,
    });
    tiles.push({
      key: `${c.id}:back`,
      cardId: c.id,
      side: "back",
      text: c.backText,
    });
  }
  return { tiles: shuffle(tiles), pairs: pool.length };
}

function MatchContent() {
  const params = useParams();
  const id = params.id as string;
  const { deck, loading, error } = useDeck(id);

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Tile | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [total, setTotal] = useState(0);

  const cards = useMemo(() => deck?.cards ?? [], [deck]);

  const newRound = useCallback(() => {
    const r = buildRound(cards);
    setTiles(r.tiles);
    setTotal(r.pairs);
    setMatched(new Set());
    setSelected(null);
    setWrongPair(null);
  }, [cards]);

  useEffect(() => {
    if (cards.length >= 2) newRound();
  }, [cards, newRound]);

  function pick(tile: Tile) {
    if (matched.has(tile.cardId)) return;
    if (wrongPair) return;
    if (!selected) {
      setSelected(tile);
      return;
    }
    if (selected.key === tile.key) {
      setSelected(null);
      return;
    }
    if (selected.cardId === tile.cardId && selected.side !== tile.side) {
      setMatched((m) => new Set(m).add(tile.cardId));
      setSelected(null);
      return;
    }
    setWrongPair([selected.key, tile.key]);
    setSelected(null);
    setTimeout(() => setWrongPair(null), 550);
  }

  const doneRound = total > 0 && matched.size === total;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
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

      {deck && cards.length < 2 ? (
        <p className="mt-6 text-sm text-zinc-500">
          Cần tối thiểu 2 thẻ để chơi ghép cặp.
        </p>
      ) : null}

      {deck && tiles.length > 0 ? (
        <>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Ghép cặp · {matched.size}/{total}
            </p>
            <button
              type="button"
              onClick={newRound}
              className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Ván mới
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {tiles.map((t) => {
              const isMatched = matched.has(t.cardId);
              const isSelected = selected?.key === t.key;
              const isWrong = wrongPair?.includes(t.key);
              let cls =
                "rounded-lg border px-3 py-4 text-sm min-h-[72px] text-left transition-colors";
              if (isMatched) {
                cls +=
                  " border-zinc-200 bg-zinc-100 text-zinc-400 line-through dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500";
              } else if (isWrong) {
                cls +=
                  " border-red-400 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/50 dark:text-red-200";
              } else if (isSelected) {
                cls +=
                  " border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900";
              } else {
                cls +=
                  " border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900";
              }
              return (
                <button
                  key={t.key}
                  type="button"
                  disabled={isMatched}
                  onClick={() => pick(t)}
                  className={cls}
                >
                  {t.text}
                </button>
              );
            })}
          </div>

          {doneRound ? (
            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500">Hoàn thành ván này</p>
              <button
                type="button"
                onClick={newRound}
                className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Ván mới
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default function MatchPage() {
  return (
    <AuthGate>
      <MatchContent />
    </AuthGate>
  );
}
