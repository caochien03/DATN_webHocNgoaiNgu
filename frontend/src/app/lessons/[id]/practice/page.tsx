"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
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

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href={`/lessons/${id}`}
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Quay lại bài
      </Link>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {exercises && exercises.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Bài này chưa có bài tập.</p>
      ) : null}

      {queue.length > 0 && !done ? (
        <>
          <p className="mt-4 text-sm text-zinc-500">
            Câu {index + 1}/{queue.length} · Điểm: {score}
          </p>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Điền vào chỗ trống
            </p>
            <p className="mt-1 text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {queue[index].prompt}
            </p>
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {queue[index].options.map((opt, i) => {
              const revealed = picked !== null;
              const isCorrect = i === queue[index].correctIndex;
              const isPicked = picked === i;
              const color = !revealed
                ? "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                : isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                  : isPicked
                    ? "border-red-500 bg-red-50 dark:bg-red-950/50"
                    : "border-zinc-300 dark:border-zinc-700";
              return (
                <li key={`${queue[index].id}-${i}`}>
                  <button
                    type="button"
                    disabled={revealed}
                    onClick={() => choose(i)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm text-zinc-900 dark:text-zinc-100 disabled:cursor-default ${color}`}
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
                <p className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {queue[index].explanation}
                </p>
              ) : null}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={next}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {index + 1 >= queue.length ? "Xem kết quả" : "Câu tiếp →"}
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {done ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Hoàn thành</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {score} / {queue.length}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sai {wrongList.length} câu.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {wrongList.length > 0 ? (
              <button
                type="button"
                onClick={() => restart(wrongList)}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Làm lại {wrongList.length} câu sai
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => restart()}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
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
