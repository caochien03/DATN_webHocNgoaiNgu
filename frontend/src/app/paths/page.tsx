"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { LearningPathRow } from "@/lib/types";

function PathsContent() {
  const [paths, setPaths] = useState<LearningPathRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/paths");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setPaths((await res.json()) as LearningPathRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được lộ trình");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Lộ trình học
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Học theo thứ tự các bước để đi từ từ vựng nền tảng tới bài học ngữ pháp.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {paths === null && !error ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
      ) : null}

      {paths ? (
        <ul className="mt-6 flex flex-col gap-3">
          {paths.map((p) => (
            <li key={p.id}>
              <Link
                href={`/paths/${p.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {p.title}
                    </p>
                    {p.description ? (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {p.description}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-zinc-500">
                      {p.level ?? p.languageCode.toUpperCase()} ·{" "}
                      {p.completedSteps}/{p.totalSteps} bước
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-zinc-500">
                    {p.percent}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full bg-zinc-900 dark:bg-zinc-100"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function PathsPage() {
  return (
    <AuthGate>
      <PathsContent />
    </AuthGate>
  );
}
