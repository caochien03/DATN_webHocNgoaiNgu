"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, GraduationCap } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { GrammarLevel, LessonRow } from "@/lib/types";

const LEVELS: { code: GrammarLevel; label: string }[] = [
  { code: "BEGINNER_1", label: "Sơ cấp 1" },
  { code: "BEGINNER_2", label: "Sơ cấp 2" },
  { code: "INTERMEDIATE_1", label: "Trung cấp 1" },
  { code: "INTERMEDIATE_2", label: "Trung cấp 2" },
  { code: "ADVANCED_1", label: "Cao cấp 1" },
  { code: "ADVANCED_2", label: "Cao cấp 2" },
];

function LessonsContent() {
  const [lessons, setLessons] = useState<LessonRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<GrammarLevel>("BEGINNER_1");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/lessons");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setLessons((await res.json()) as LessonRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được bài học");
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
    <div>
      <PageHeader
        title="Bài học ngữ pháp"
        sub="Mỗi bài gồm từ vựng, điểm ngữ pháp và bài tập luyện tập"
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {LEVELS.map((l) => {
          const active = level === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLevel(l.code)}
              className="relative rounded-xl px-4 py-1.5 text-sm font-medium"
              style={{ color: active ? "#fff" : BRAND.muted }}
            >
              {active ? (
                <motion.span
                  layoutId="lesson-filter"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `linear-gradient(90deg,${BRAND.blue},${BRAND.cyan})` }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : (
                <span
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                />
              )}
              <span className="relative">
                {l.label}
                <span className="ml-2 text-xs opacity-70">{counts[l.code] ?? 0}</span>
              </span>
            </button>
          );
        })}
      </div>

      {lessons === null && !error ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có bài nào ở cấp này.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/lessons/${l.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${BRAND.cyan}18`, color: BRAND.cyan }}
                >
                  <GraduationCap size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{l.title}</p>
                  {l.summary ? (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {l.summary}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {l._count.vocabulary} từ · {l._count.points} ngữ pháp
                    {l._count.exercises > 0 ? ` · ${l._count.exercises} bài tập` : ""}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LessonsPage() {
  return (
    <AuthGate>
      <LessonsContent />
    </AuthGate>
  );
}
