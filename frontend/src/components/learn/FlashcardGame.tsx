"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Keyboard,
  Layers3,
  Repeat2,
  Shuffle,
  Sparkles,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BRAND } from "@/components/ui-kit/brand";
import { shuffle } from "@/lib/shuffle";
import type { LearnCard } from "./types";

export function FlashcardGame({ cards }: { cards: LearnCard[] }) {
  const [order, setOrder] = useState<LearnCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (cards.length > 0) {
      setOrder(shuffle(cards));
      setIndex(0);
      setFlipped(false);
    } else {
      setOrder([]);
    }
  }, [cards]);

  const current = order[index];

  // Speech TTS
  function speak(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setFlipped(false);
        setIndex((i) => (i + 1) % order.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFlipped(false);
        setIndex((i) => (i - 1 + order.length) % order.length);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [order.length]);

  if (order.length === 0 || !current) {
    return <p className="mt-6 text-sm text-muted-foreground">Chưa có thẻ nào.</p>;
  }

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % order.length);
  }
  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + order.length) % order.length);
  }
  function reshuffle() {
    setOrder(shuffle(cards));
    setIndex(0);
    setFlipped(false);
  }

  const progressPercent = Math.round(((index + 1) / order.length) * 100);

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 16px 0 ${BRAND.blue}35`,
            }}
          >
            <Layers3 size={22} />
          </span>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
              Luyện phản xạ từ vựng
            </span>
            <p className="text-lg font-black text-foreground">Flashcard 3D</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-xs font-bold text-primary">
            {index + 1} / {order.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Flashcard 3D interactive Box */}
      <div className="mt-6 flex justify-center [perspective:1200px]">
        <motion.div
          onClick={() => setFlipped((f) => !f)}
          className="relative min-h-[340px] w-full max-w-2xl cursor-pointer select-none rounded-3xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-8 text-center shadow-md transition-shadow hover:shadow-xl"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            transformStyle: "preserve-3d",
            boxShadow: flipped
              ? "0 20px 40px -15px rgba(5, 150, 105, 0.2)"
              : "0 20px 40px -15px rgba(59, 110, 255, 0.2)",
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* FRONT SIDE */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-between p-8 ${
              flipped ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transition: "opacity 0.2s ease",
            }}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider"
                style={{
                  background: `${BRAND.blue}15`,
                  color: BRAND.blue,
                  border: `1px solid ${BRAND.blue}30`,
                }}
              >
                <Sparkles size={13} /> Mặt trước · Từ gốc
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(current.frontText);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/80 text-muted-foreground transition hover:border-primary hover:text-primary"
                title="Phát âm"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div className="my-auto">
              <p className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {current.frontText}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Repeat2 size={14} className="text-primary" />
              <span>Bấm vào thẻ hoặc phím Space để xem nghĩa</span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-between p-8 [transform:rotateY(180deg)] ${
              flipped ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transition: "opacity 0.2s ease",
            }}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider"
                style={{
                  background: `${BRAND.green}15`,
                  color: BRAND.green,
                  border: `1px solid ${BRAND.green}30`,
                }}
              >
                <Sparkles size={13} /> Mặt sau · Giải nghĩa
              </span>
              <span className="text-xs font-bold text-muted-foreground">Tiếng Việt</span>
            </div>

            <div className="my-auto flex flex-col items-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
                {current.backText}
              </p>
              {current.note ? (
                <p className="mt-4 rounded-xl border border-border bg-secondary/70 px-4 py-2 text-xs font-bold text-muted-foreground">
                  💡 {current.note}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Repeat2 size={14} className="text-emerald-500" />
              <span>Bấm để lật lại mặt trước</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control Buttons Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={prev}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-xs transition hover:border-primary/40 hover:bg-secondary hover:text-foreground"
            aria-label="Thẻ trước"
            whileTap={{ scale: 0.94 }}
          >
            <ArrowLeft size={18} />
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-2.5 text-xs font-black text-foreground shadow-xs transition hover:border-primary/40 hover:bg-secondary"
            whileTap={{ scale: 0.94 }}
          >
            <Repeat2 size={16} className="text-primary" /> Lật thẻ
          </motion.button>
          <motion.button
            type="button"
            onClick={next}
            className="flex h-11 items-center gap-2 rounded-2xl px-6 text-xs font-black text-white shadow-md transition hover:opacity-95"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 16px 0 ${BRAND.blue}40`,
            }}
            aria-label="Thẻ tiếp theo"
            whileTap={{ scale: 0.94 }}
          >
            <span>Tiếp theo</span>
            <ArrowRight size={16} />
          </motion.button>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
          <button
            type="button"
            onClick={reshuffle}
            className="flex items-center gap-1.5 transition hover:text-primary"
          >
            <Shuffle size={14} /> Trộn ngẫu nhiên
          </button>
          <span className="hidden md:inline-flex items-center gap-1 opacity-70">
            <Keyboard size={13} /> Phím ← / → / Space
          </span>
        </div>
      </div>
    </section>
  );
}
