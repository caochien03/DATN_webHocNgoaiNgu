"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleX,
  Dumbbell,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { shuffle } from "@/lib/shuffle";
import type { GrammarExercise } from "@/lib/types";

function PracticeContent() {
  const params = useParams();
  const id = params.id as string;

  const [exercises, setExercises] = useState<GrammarExercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<GrammarExercise[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrongList, setWrongList] = useState<GrammarExercise[]>([]);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/lessons/${id}/exercises`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExercises((await res.json()) as GrammarExercise[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được bài tập");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (exercises && exercises.length > 0) {
      setQueue(shuffle(exercises));
      setIndex(0);
      setPicked(null);
      setScore(0);
      setWrongList([]);
      setDone(false);
    }
  }, [exercises]);

  function choose(i: number) {
    if (picked !== null) return;
    const q = queue[index];
    if (!q) return;
    setPicked(i);
    const ok = i === q.correctIndex;
    if (ok) {
      setScore((s) => s + 1);
    } else {
      setWrongList((w) => (w.some((x) => x.id === q.id) ? w : [...w, q]));
    }
  }

  function next() {
    if (index + 1 >= queue.length) {
      setDone(true);
      return;
    }
    setIndex((v) => v + 1);
    setPicked(null);
  }

  function restart(source: GrammarExercise[] = exercises ?? []) {
    setQueue(shuffle(source));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setWrongList([]);
    setDone(false);
  }

  const pct = queue.length > 0 ? Math.round((score / queue.length) * 100) : 0;
  const current = queue[index];

  return (
    <div className="mx-auto max-w-xl pb-10">
      <Link
        href={`/lessons/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Quay lại bài học
      </Link>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {exercises && exercises.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          Bài học này chưa có bài tập trắc nghiệm.
        </div>
      ) : null}

      {queue.length > 0 && !done && current ? (
        <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
          {/* Top Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})` }}
              >
                <Dumbbell size={22} />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Luyện tập ngữ pháp</span>
                <p className="text-lg font-extrabold text-foreground">Điền vào chỗ trống</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
                Câu {index + 1} / {queue.length}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-500">
                {score} điểm
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary/80">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(((index + 1) / queue.length) * 100)}%`,
                background: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.blue})`,
              }}
            />
          </div>

          {/* Prompt Box */}
          <div
            className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-border p-7 text-center shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${BRAND.purple}12 0%, var(--card) 60%, ${BRAND.blue}12 100%)`,
            }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              <Sparkles size={12} /> Chọn đáp án điền vào chỗ trống:
            </span>
            <p className="mt-3 text-xl font-black text-foreground sm:text-2xl leading-relaxed">
              {current.prompt}
            </p>
          </div>

          {/* Options */}
          <div className="mt-5 flex flex-col gap-2.5">
            {current.options.map((opt, i) => {
              const revealed = picked !== null;
              const isCorrect = i === current.correctIndex;
              const isPicked = picked === i;
              const letters = ["A", "B", "C", "D"];

              let className =
                "group relative flex min-h-[58px] w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-default ";

              if (revealed) {
                if (isCorrect) {
                  className += "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10";
                } else if (isPicked) {
                  className += "border-red-500 bg-red-500/15 text-red-500 shadow-md shadow-red-500/10";
                } else {
                  className += "border-border bg-card/60 opacity-60";
                }
              } else {
                className += "border-border bg-card hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/60 hover:shadow-md";
              }

              return (
                <button
                  key={`${current.id}-${i}`}
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(i)}
                  className={className}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors ${
                      revealed && isCorrect
                        ? "bg-emerald-500 text-white"
                        : revealed && isPicked
                        ? "bg-red-500 text-white"
                        : "bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-white"
                    }`}
                  >
                    {revealed && isCorrect ? (
                      <Check size={16} />
                    ) : revealed && isPicked ? (
                      <CircleX size={16} />
                    ) : (
                      letters[i]
                    )}
                  </span>
                  <span className="font-bold text-foreground">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation & Next */}
          {picked !== null ? (
            <div className="mt-5 space-y-4">
              {current.explanation ? (
                <div className="flex items-start gap-2.5 rounded-2xl bg-secondary/70 p-4 text-xs leading-relaxed text-foreground border border-border">
                  <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground">Giải thích chi tiết: </span>
                    <span className="text-muted-foreground">{current.explanation}</span>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
                    boxShadow: `0 4px 14px 0 ${BRAND.purple}35`,
                  }}
                >
                  <span>{index + 1 >= queue.length ? "Xem tổng kết" : "Câu tiếp theo"}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Done Celebration */}
      {done ? (
        <div className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-lg md:p-10">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 to-transparent" />
          <div
            className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl shadow-primary/25"
            style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})` }}
          >
            <Trophy size={32} />
          </div>
          <p className="relative mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Hoàn thành bài luyện tập
          </p>
          <p
            className="relative mt-1 text-5xl font-black tracking-tight sm:text-6xl"
            style={{ color: scoreColor(pct) }}
          >
            {pct}%
          </p>
          <div className="relative mt-3 flex items-center justify-center gap-3">
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">
              ✓ Đúng: {score} câu
            </span>
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-500">
              ✗ Sai: {wrongList.length} câu
            </span>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
            {wrongList.length > 0 ? (
              <button
                type="button"
                onClick={() => restart(wrongList)}
                className="rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
                  boxShadow: `0 4px 14px 0 ${BRAND.purple}35`,
                }}
              >
                Làm lại {wrongList.length} câu sai
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => restart()}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-secondary hover:border-primary/40"
            >
              <RotateCcw size={16} /> Làm lại toàn bài
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function LessonPracticePage() {
  return (
    <AuthGate>
      <PracticeContent />
    </AuthGate>
  );
}
