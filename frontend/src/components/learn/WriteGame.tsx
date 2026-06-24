"use client";

import { useEffect, useState } from "react";
import { BRAND, GRADIENT, scoreColor } from "@/components/ui-kit/brand";
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
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-4xl font-bold" style={{ color: scoreColor(pctScore) }}>
          {score}/{queue.length}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Sai {wrongCards.length} từ.</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {wrongCards.length > 0 ? (
            <button
              type="button"
              onClick={() => restart(wrongCards)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: GRADIENT }}
            >
              Ôn lại {wrongCards.length} từ sai
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => restart()}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Làm lại cả bộ
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <>
      <p className="mt-4 text-sm text-muted-foreground">
        Thẻ {index + 1}/{queue.length} · Điểm: {score}
      </p>
      <div className="mt-3 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Viết từ cho nghĩa sau
        </p>
        <p className="mt-1 text-xl font-bold text-foreground">{current.backText}</p>
        {current.note ? (
          <p className="mt-1 text-xs text-muted-foreground">{current.note}</p>
        ) : null}
      </div>

      <form onSubmit={check} className="mt-4 flex flex-col gap-3">
        <input
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={result !== null}
          placeholder="Nhập đáp án…"
          className="rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
        />
        {result === null ? (
          <button
            type="submit"
            className="rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            Kiểm tra
          </button>
        ) : (
          <div
            className="rounded-xl border px-3 py-2 text-sm"
            style={{
              borderColor: result === "correct" ? BRAND.green : BRAND.red,
              backgroundColor: `${result === "correct" ? BRAND.green : BRAND.red}14`,
              color: result === "correct" ? BRAND.green : BRAND.red,
            }}
          >
            {result === "correct" ? (
              <span>Chính xác.</span>
            ) : (
              <span>
                Sai. Đáp án:{" "}
                <strong className="font-semibold">{current.frontText}</strong>
              </span>
            )}
          </div>
        )}
        {result !== null ? (
          <button
            type="button"
            onClick={next}
            className="rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            {index + 1 >= queue.length ? "Xem kết quả" : "Thẻ tiếp →"}
          </button>
        ) : null}
      </form>
    </>
  );
}
