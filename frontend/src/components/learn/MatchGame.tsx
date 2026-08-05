"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle2, Link2, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { BRAND } from "@/components/ui-kit/brand";
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
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.cyan})`,
              boxShadow: `0 4px 16px 0 ${BRAND.green}35`,
            }}
          >
            <Link2 size={22} />
          </span>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
              Phản xạ kết nối
            </span>
            <p className="text-lg font-black text-foreground">Ghép Cặp Từ Vựng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {matched.size} / {total} cặp
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.cyan})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground">
          Chọn một ô từ vựng và một ô nghĩa tiếng Việt tương ứng để nối cặp.
        </p>
        <button
          type="button"
          onClick={newRound}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <RotateCcw size={13} /> Trộn ván mới
        </button>
      </div>

      {/* Matching Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {tiles.map((t) => {
          const isMatched = matched.has(t.cardId);
          const isSelected = selected?.key === t.key;
          const isWrong = wrongPair?.includes(t.key);

          let tileClass = "border-border bg-card hover:border-primary/50 hover:bg-secondary/60 text-foreground";

          if (isMatched) {
            tileClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-60 scale-95 pointer-events-none";
          } else if (isSelected) {
            tileClass = "border-primary bg-primary/10 text-primary ring-2 ring-primary/40 scale-102 shadow-md";
          } else if (isWrong) {
            tileClass = "border-red-500 bg-red-500/10 text-red-500 ring-2 ring-red-500/40 animate-shake";
          }

          return (
            <motion.button
              key={t.key}
              type="button"
              onClick={() => pick(t)}
              disabled={isMatched}
              className={`relative flex min-h-[100px] flex-col items-center justify-center rounded-2xl border p-4 text-center text-sm font-black transition-all ${tileClass}`}
              whileHover={!isMatched && !isSelected ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isMatched ? { scale: 0.96 } : {}}
            >
              {isMatched ? (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={12} />
                </span>
              ) : null}
              <span className="line-clamp-2">{t.text}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Done Celebration */}
      {doneRound ? (
        <motion.div
          className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center shadow-xs"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={24} />
            <h4 className="text-lg font-black">Xuất sắc! Bạn đã ghép đúng toàn bộ {total} cặp thẻ!</h4>
          </div>
          <motion.button
            type="button"
            onClick={newRound}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.cyan})`,
              boxShadow: `0 4px 16px 0 ${BRAND.green}35`,
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <RotateCcw size={15} /> Chơi tiếp ván mới
          </motion.button>
        </motion.div>
      ) : null}
    </section>
  );
}
