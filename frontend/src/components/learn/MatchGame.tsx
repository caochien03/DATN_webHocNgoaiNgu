"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Link2, RotateCcw, Trophy } from "lucide-react";
import { BRAND, GRADIENT_DIAGONAL } from "@/components/ui-kit/brand";
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
    <section className="mt-5 rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_45px_-38px_rgba(249,115,22,0.8)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Link2 size={19} /></span>
          <div>
            <p className="text-sm font-bold text-foreground">Ghép cặp</p>
            <p className="text-xs text-muted-foreground">Chọn một từ và một nghĩa tương ứng</p>
          </div>
        </div>
        <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">{matched.size}/{total} cặp</span>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (matched.size / total) * 100 : 0}%`, background: GRADIENT_DIAGONAL }} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Hoàn thành tất cả các cặp để kết thúc ván.</p>
        <button
          type="button"
          onClick={newRound}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw size={15} /> Ván mới
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {tiles.map((t) => {
          const isMatched = matched.has(t.cardId);
          const isSelected = selected?.key === t.key;
          const isWrong = wrongPair?.includes(t.key);
          let cls =
            "relative flex min-h-[104px] items-center justify-center rounded-2xl border px-4 py-4 text-center text-sm font-medium transition-all duration-200 ";
          if (isMatched) {
            cls += "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-500/70";
          } else if (isWrong) {
            cls += "border-red-500 bg-red-500/10 text-red-400";
          } else if (isSelected) {
            cls += "border-primary bg-primary/15 text-foreground shadow-lg shadow-primary/10";
          } else {
            cls += "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5";
          }
          return (
            <button
              key={t.key}
              type="button"
              disabled={isMatched}
            onClick={() => pick(t)}
            className={cls}
          >
            {isMatched ? (
              <span className="flex flex-col items-center gap-1.5"><Check size={18} /><span className="text-xs">Đã ghép</span></span>
            ) : (
              <span>{t.text}</span>
            )}
          </button>
          );
        })}
      </div>

      {doneRound ? (
        <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: BRAND.green }}><Trophy size={19} /></span>
          <p className="mt-3 font-bold text-foreground">Hoàn thành ván này!</p>
          <p className="mt-1 text-sm text-muted-foreground">Bạn đã ghép đúng {total} cặp từ vựng.</p>
          <button
            type="button"
            onClick={newRound}
            className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20"
            style={{ background: GRADIENT_DIAGONAL }}
          >
            Ván mới
          </button>
        </div>
      ) : null}
    </section>
  );
}
