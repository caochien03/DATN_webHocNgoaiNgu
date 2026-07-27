"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, CircleX, PenLine, RotateCcw, Trophy } from "lucide-react";
import { BRAND, GRADIENT_DIAGONAL, scoreColor } from "@/components/ui-kit/brand";
import { shuffle } from "@/lib/shuffle";
import type { AttemptHandler, LearnCard } from "./types";

function normalize(value: string): string {
  return value.trim().normalize("NFC").replace(/\s+/g, " ").toLowerCase();
}

export function WriteGame({
  cards,
  onAttempt,
}: {
  cards: LearnCard[];
  onAttempt?: AttemptHandler;
}) {
  const [queue, setQueue] = useState<LearnCard[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [score, setScore] = useState(0);
  const [wrongCards, setWrongCards] = useState<LearnCard[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cards.length > 0) {
      setQueue(shuffle(cards));
      setIndex(0);
      setAnswer("");
      setResult(null);
      setScore(0);
      setWrongCards([]);
      setDone(false);
    } else {
      setQueue([]);
    }
  }, [cards]);

  if (cards.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">Chưa có thẻ nào.</p>;
  }

  const current = queue[index];

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (result !== null || !current) return;
    const ok = normalize(answer) === normalize(current.frontText);
    setResult(ok ? "correct" : "wrong");
    if (ok) {
      setScore((s) => s + 1);
    } else {
      setWrongCards((w) =>
        w.some((c) => c.id === current.id) ? w : [...w, current],
      );
    }
    onAttempt?.(current.id, ok);
  }

  function next() {
    if (index + 1 >= queue.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setResult(null);
  }

  function restart(target: LearnCard[] = cards) {
    setQueue(shuffle(target));
    setIndex(0);
    setAnswer("");
    setResult(null);
    setScore(0);
    setWrongCards([]);
    setDone(false);
  }

  if (done) {
    const pctScore = queue.length > 0 ? Math.round((score / queue.length) * 100) : 0;
    return (
      <div className="relative mt-5 overflow-hidden rounded-[28px] border border-border bg-card p-8 text-center shadow-[0_18px_45px_-38px_rgba(249,115,22,0.8)]">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/25" style={{ background: GRADIENT_DIAGONAL }}><Trophy size={26} /></div>
        <p className="relative mt-4 text-sm font-semibold text-muted-foreground">Hoàn thành lượt viết</p>
        <p className="relative mt-1 text-5xl font-bold tracking-tight" style={{ color: scoreColor(pctScore) }}>{pctScore}%</p>
        <p className="relative mt-2 text-sm text-muted-foreground">Đúng {score}/{queue.length} từ · Sai {wrongCards.length} từ</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {wrongCards.length > 0 ? (
            <button
              type="button"
              onClick={() => restart(wrongCards)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20"
              style={{ background: GRADIENT_DIAGONAL }}
            >
              Ôn lại {wrongCards.length} từ sai
            </button>
          ) : null}
          <button
              type="button"
              onClick={() => restart()}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw size={15} /> Làm lại cả bộ
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <section className="mt-5 rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_45px_-38px_rgba(249,115,22,0.8)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><PenLine size={19} /></span>
          <div>
            <p className="text-sm font-bold text-foreground">Luyện viết</p>
            <p className="text-xs text-muted-foreground">Nhìn nghĩa và gõ lại từ vựng</p>
          </div>
        </div>
        <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">Điểm {score}</span>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((index + 1) / queue.length) * 100}%`, background: GRADIENT_DIAGONAL }} />
      </div>

      <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/[0.045] px-6 py-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Viết từ cho nghĩa sau</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{current.backText}</p>
        {current.note ? (
          <p className="mt-3 text-xs text-muted-foreground">{current.note}</p>
        ) : null}
      </div>

      <form onSubmit={check} className="mt-5 flex flex-col gap-3">
        <input
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={result !== null}
          placeholder="Nhập đáp án…"
          className="rounded-2xl border border-border bg-background px-4 py-3.5 text-center text-lg font-semibold text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
        />
        {result === null ? (
          <button
            type="submit"
            className="rounded-xl py-3 text-sm font-semibold text-white shadow-md shadow-primary/20"
            style={{ background: GRADIENT_DIAGONAL }}
          >
            Kiểm tra
          </button>
        ) : (
          <div
            className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm"
            style={{
              borderColor: result === "correct" ? BRAND.green : BRAND.red,
              backgroundColor: `${result === "correct" ? BRAND.green : BRAND.red}14`,
              color: result === "correct" ? BRAND.green : BRAND.red,
            }}
          >
            {result === "correct" ? (
              <><CheckCircle2 size={18} /><span>Chính xác, rất tốt!</span></>
            ) : (
              <><CircleX size={18} /><span>
                Sai. Đáp án:{" "}
                <strong className="font-semibold">{current.frontText}</strong>
              </span></>
            )}
          </div>
        )}
        {result !== null ? (
          <button
            type="button"
            onClick={next}
            className="flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold text-white shadow-md shadow-primary/20"
            style={{ background: GRADIENT_DIAGONAL }}
          >
            {index + 1 >= queue.length ? "Xem kết quả" : "Thẻ tiếp"} <ChevronRight size={16} />
          </button>
        ) : null}
      </form>
    </section>
  );
}
