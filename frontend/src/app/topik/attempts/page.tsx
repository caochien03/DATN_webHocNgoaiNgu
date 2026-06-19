"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import {
  topikAttemptModeLabel,
  topikSectionLabel,
  topikTierLabel,
} from "@/lib/topik-labels";
import { getAttemptListScoreLines } from "@/lib/topik-writing-grade-status";
import type { TopikAttemptRow } from "@/lib/types";

function AttemptsContent() {
  const [attempts, setAttempts] = useState<TopikAttemptRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/topik/attempts");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setAttempts((await res.json()) as TopikAttemptRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được lịch sử");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        href="/topik"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Luyện TOPIK
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Lịch sử làm bài</h1>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      {attempts === null ? (
        <p className="mt-4 text-sm text-zinc-500">Đang tải…</p>
      ) : attempts.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">Chưa có bài làm nào.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {attempts.map((a) => {
            const scores = getAttemptListScoreLines(a);
            return (
            <li
              key={a.id}
              className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {topikAttemptModeLabel(a.mode)}
                    {a.exam ? ` · ${a.exam.title}` : null}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {topikTierLabel(a.tier)}
                    {a.section
                      ? ` · ${topikSectionLabel(a.section)}`
                      : null}
                    {a.formatFromNo != null && a.formatToNo != null
                      ? ` · câu ${a.formatFromNo}${a.formatToNo !== a.formatFromNo ? `–${a.formatToNo}` : ""}`
                      : null}
                  </p>
                  {scores.mcqLine || scores.writingLine ? (
                    <div className="mt-1 space-y-0.5 text-xs">
                      {scores.mcqLine ? (
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {scores.mcqLine}
                        </p>
                      ) : null}
                      {scores.writingLine ? (
                        <p
                          className={
                            scores.writingTone === "emerald"
                              ? "text-emerald-700 dark:text-emerald-300"
                              : scores.writingTone === "amber"
                                ? "text-amber-800 dark:text-amber-200"
                                : "text-zinc-600 dark:text-zinc-400"
                          }
                        >
                          {scores.writingLine}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-500">
                      {a.correctCount}/{a.totalQuestions} ({a.scorePercent}%)
                    </p>
                  )}
                  {a.finishedAt ? (
                    <p className="mt-1 text-xs text-zinc-400">
                      {new Date(a.finishedAt).toLocaleString("vi-VN")}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/topik/attempts/${a.id}`}
                  className="text-sm hover:underline"
                >
                  Chi tiết
                </Link>
              </div>
            </li>
          );})}
        </ul>
      )}
    </div>
  );
}

export default function TopikAttemptsPage() {
  return (
    <AuthGate>
      <AttemptsContent />
    </AuthGate>
  );
}
