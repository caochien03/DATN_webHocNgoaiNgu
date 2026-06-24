"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { scoreColor } from "@/components/ui-kit/brand";
import {
  backLinkClass,
  errorClass,
  ghostButtonClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
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

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href={`/lessons/${id}`} className={backLinkClass}>
        ← Quay lại bài
      </Link>

      {error ? (
        <p className={`mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 ${errorClass}`}>
          {error}
        </p>
      ) : null}

      {exercises && exercises.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Bài này chưa có bài tập.</p>
      ) : null}

      {queue.length > 0 && !done ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Câu {index + 1}/{queue.length} · Điểm: {score}
          </p>
          <div className="mt-3 rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Điền vào chỗ trống
            </p>
            <p className="mt-1 text-lg font-medium text-foreground">
              {queue[index].prompt}
            </p>
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {queue[index].options.map((opt, i) => {
              const revealed = picked !== null;
              const isCorrect = i === queue[index].correctIndex;
              const isPicked = picked === i;
              const color = !revealed
                ? "border-border bg-secondary/40 hover:bg-secondary"
                : isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : isPicked
                    ? "border-red-500/40 bg-red-500/10"
                    : "border-border bg-secondary/20";
              return (
                <li key={`${queue[index].id}-${i}`}>
                  <button
                    type="button"
                    disabled={revealed}
                    onClick={() => choose(i)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm text-foreground transition disabled:cursor-default ${color}`}
                  >
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>

          {picked !== null ? (
            <>
              {queue[index].explanation ? (
                <p className="mt-3 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                  {queue[index].explanation}
                </p>
              ) : null}
              <div className="mt-4 flex justify-end">
                <GradientButton type="button" onClick={next}>
                  {index + 1 >= queue.length ? "Xem kết quả" : "Câu tiếp →"}
                </GradientButton>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {done ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Hoàn thành</p>
          <p
            className="mt-1 text-3xl font-bold"
            style={{ color: scoreColor(pct) }}
          >
            {score} / {queue.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sai {wrongList.length} câu.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {wrongList.length > 0 ? (
              <GradientButton type="button" onClick={() => restart(wrongList)}>
                Làm lại {wrongList.length} câu sai
              </GradientButton>
            ) : null}
            <button
              type="button"
              onClick={() => restart()}
              className={ghostButtonClass}
            >
              Làm lại toàn bài
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
