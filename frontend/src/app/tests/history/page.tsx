"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { QuizAttempt } from "@/lib/types";

function label(sourceType: QuizAttempt["sourceType"]): string {
  if (sourceType === "DECK") return "Bộ từ";
  if (sourceType === "TOPIC") return "Chủ đề";
  if (sourceType === "LESSON") return "Bài học";
  return "Lộ trình";
}

function TestsHistoryContent() {
  const [attempts, setAttempts] = useState<QuizAttempt[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/quiz-attempts");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setAttempts((await res.json()) as QuizAttempt[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được lịch sử");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const avgScore = useMemo(() => {
    if (!attempts || attempts.length === 0) return 0;
    const total = attempts.reduce((sum, a) => sum + a.scorePercent, 0);
    return Math.round(total / attempts.length);
  }, [attempts]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Lịch sử kiểm tra
        </h1>
        <Link
          href="/tests"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Làm bài mới
        </Link>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {attempts === null ? (
        <p className="mt-4 text-sm text-zinc-500">Đang tải...</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                Số lần làm
              </p>
              <p className="mt-1 text-xl font-semibold">{attempts.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                Điểm TB
              </p>
              <p className="mt-1 text-xl font-semibold">{avgScore}%</p>
            </div>
          </div>

          {attempts.length === 0 ? (
            <p className="mt-5 text-sm text-zinc-500">Bạn chưa có lần kiểm tra nào.</p>
          ) : (
            <ul className="mt-5 flex flex-col gap-2">
              {attempts.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                        {a.sourceTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {label(a.sourceType)} · {new Date(a.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {a.correctAnswers}/{a.totalQuestions} ({a.scorePercent}%)
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default function TestsHistoryPage() {
  return (
    <AuthGate>
      <TestsHistoryContent />
    </AuthGate>
  );
}
