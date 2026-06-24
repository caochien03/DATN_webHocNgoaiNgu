"use client";

import { useCallback, useEffect, useState } from "react";
import { GRADIENT } from "@/components/ui-kit/brand";
import { shuffle } from "@/lib/shuffle";
import type { LearnCard } from "./types";

type Side = "front" | "back";
type Tile = {
  key: string;
  cardId: string;
  side: Side;
  text: string;
};

const ROUND_SIZE = 6;

function buildRound(cards: LearnCard[]): { tiles: Tile[]; pairs: number } {
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

export function MatchGame({ cards }: { cards: LearnCard[] }) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [total, setTotal] = useState(0);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Tile | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);

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

  if (cards.length < 2) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Cần tối thiểu 2 thẻ để chơi ghép cặp.
      </p>
    );
  }

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
    <>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Ghép cặp · {matched.size}/{total}
        </p>
        <button
          type="button"
          onClick={newRound}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
            "rounded-xl border px-3 py-4 text-sm min-h-[72px] text-left transition-colors ";
          if (isMatched) {
            cls += "border-border bg-secondary text-muted-foreground/60 line-through";
          } else if (isWrong) {
            cls += "border-red-500 bg-red-500/10 text-red-300";
          } else if (isSelected) {
            cls += "border-primary bg-primary/15 text-white";
          } else {
            cls += "border-border bg-card text-foreground hover:border-primary/40";
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
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Hoàn thành ván này</p>
          <button
            type="button"
            onClick={newRound}
            className="mt-3 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            Ván mới
          </button>
        </div>
      ) : null}
    </>
  );
}
