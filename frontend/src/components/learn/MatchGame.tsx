"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle2, Link2, RotateCcw, Sparkles, Trophy } from "lucide-react";
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
  const progressPercent = total > 0 ? Math.round((matched.size / total) * 100) : 0;

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.cyan})` }}
          >
            <Link2 size={22} />
          </span>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Nhanh mắt nhanh tay</span>
            <p className="text-lg font-extrabold text-foreground">Ghép Cặp Từ Vựng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-500">
            {matched.size} / {total} cặp
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary/80">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.cyan})`,
          }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">
          Chọn một ô từ vựng và một ô nghĩa tiếng Việt tương ứng để kết nối.
        </p>
        <button
          type="button"
          onClick={newRound}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw size={14} /> Trộn ván mới
        </button>
      </div>

      {/* Matching Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {tiles.map((t) => {
          const isMatched = matched.has(t.cardId);
          const isSelected = selected?.key === t.key;
          const isWrong = wrongPair?.includes(t.key);

          let dynamicStyle = {};
          let className =
            "relative flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-2xl border p-4 text-center text-sm font-bold transition-all duration-200 select-none ";

          if (isMatched) {
            className += "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-60 scale-95 cursor-default";
          } else if (isWrong) {
            className += "border-red-500 bg-red-500/20 text-red-500 animate-shake scale-105 shadow-md shadow-red-500/20";
          } else if (isSelected) {
            className += "border-primary bg-primary/15 text-primary scale-105 shadow-lg shadow-primary/20 ring-2 ring-primary/40";
          } else {
            className += "border-border bg-card text-foreground hover:-translate-y-1 hover:border-primary/40 hover:shadow-md hover:bg-secondary/50";
          }

          return (
            <button
              key={t.key}
              type="button"
              disabled={isMatched}
              onClick={() => pick(t)}
              className={className}
              style={dynamicStyle}
            >
              {isMatched ? (
                <div className="flex flex-col items-center gap-1">
                  <Check size={20} className="text-emerald-500" />
                  <span className="text-[11px] font-bold line-through">{t.text}</span>
                </div>
              ) : (
                <span className="break-words leading-snug">{t.text}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Dialog */}
      {doneRound ? (
        <div className="mt-6 relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-cyan-500/10 p-6 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.cyan})` }}>
            <Trophy size={28} />
          </div>
          <p className="mt-3 text-lg font-black text-foreground">Tuyệt vời! Hoàn thành ván ghép cặp</p>
          <p className="mt-1 text-xs text-muted-foreground">Bạn đã ghép chính xác toàn bộ {total} cặp từ vựng trong lượt này.</p>
          <button
            type="button"
            onClick={newRound}
            className="mt-4 rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.cyan})`,
              boxShadow: `0 4px 14px 0 ${BRAND.green}35`,
            }}
          >
            Chơi ván tiếp theo
          </button>
        </div>
      ) : null}
    </section>
  );
}
