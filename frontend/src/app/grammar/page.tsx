"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { GrammarLessonRow, GrammarLevel } from "@/lib/types";

const LEVELS: { code: GrammarLevel; label: string }[] = [
  { code: "BEGINNER_1", label: "Sơ cấp 1" },
  { code: "BEGINNER_2", label: "Sơ cấp 2" },
  { code: "INTERMEDIATE_1", label: "Trung cấp 1" },
  { code: "INTERMEDIATE_2", label: "Trung cấp 2" },
  { code: "ADVANCED_1", label: "Cao cấp 1" },
  { code: "ADVANCED_2", label: "Cao cấp 2" },
];

function GrammarContent() {
  const [lessons, setLessons] = useState<GrammarLessonRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<GrammarLevel>("BEGINNER_1");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/grammar/lessons");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setLessons((await res.json()) as GrammarLessonRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được ngữ pháp");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of lessons ?? []) map[l.level] = (map[l.level] ?? 0) + 1;
    return map;
  }, [lessons]);

  const filtered = useMemo(
    () => (lessons ?? []).filter((l) => l.level === level),
    [lessons, level],
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Ngữ pháp tiếng Hàn
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Chọn cấp độ, sau đó chọn bài để xem các điểm ngữ pháp trong bài.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <nav className="mt-6 flex flex-wrap gap-2">
        {LEVELS.map((l) => {
          const active = level === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLevel(l.code)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              <span className="font-medium">{l.label}</span>
              <span
                className={`ml-2 text-xs ${
                  active ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {counts[l.code] ?? 0} bài
              </span>
            </button>
          );
        })}
      </nav>

      <section className="mt-6">
        {lessons === null && !error ? (
          <p className="text-sm text-zinc-500">Đang tải…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-zinc-500">Chưa có bài nào ở cấp này.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/grammar/lessons/${l.id}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {l.title}
                    </p>
                    {l.summary ? (
                      <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                        {l.summary}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-zinc-500">
                      {l._count.points} điểm ngữ pháp
                      {l._count.exercises > 0
                        ? ` · ${l._count.exercises} bài tập`
                        : ""}
                    </p>
                  </div>
                  <span className="self-center text-zinc-400">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function GrammarPage() {
  return (
    <AuthGate>
      <GrammarContent />
    </AuthGate>
  );
}
