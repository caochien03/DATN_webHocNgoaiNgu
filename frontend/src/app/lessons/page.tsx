"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, GraduationCap } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import type { GrammarLevel, LessonRow } from "@/lib/types";

const LEVELS: { code: GrammarLevel; label: string; color: string }[] = [
  { code: "BEGINNER_1", label: "Sơ cấp 1", color: BRAND.green },
  { code: "BEGINNER_2", label: "Sơ cấp 2", color: BRAND.cyan },
  { code: "INTERMEDIATE_1", label: "Trung cấp 1", color: BRAND.blue },
  { code: "INTERMEDIATE_2", label: "Trung cấp 2", color: BRAND.yellow },
  { code: "ADVANCED_1", label: "Cao cấp 1", color: BRAND.purple },
  { code: "ADVANCED_2", label: "Cao cấp 2", color: BRAND.red },
];

function LessonsContent() {
  const { languageCode } = useLearningLanguage();
  const [lessons, setLessons] = useState<LessonRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<GrammarLevel>("BEGINNER_1");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/lessons", languageCode),
      );
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setLessons((await res.json()) as LessonRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được bài học");
    }
  }, [languageCode]);

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

  const activeLevelObj = LEVELS.find((l) => l.code === level) ?? LEVELS[0];

  return (
    <div>
      <PageHeader
        title="Bài học ngữ pháp"
        sub="Mỗi bài gồm từ vựng trọng tâm, điểm ngữ pháp và bài tập thực hành"
      />

      {error ? (
        <p className="mb-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {/* Level filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {LEVELS.map((l) => {
          const active = level === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLevel(l.code)}
              className="relative rounded-2xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                color: active ? "#ffffff" : "var(--foreground)",
                border: active ? "1px solid transparent" : "1px solid var(--border)",
              }}
            >
              {active ? (
                <motion.span
                  layoutId="lesson-filter"
                  className="absolute inset-0 rounded-2xl shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${l.color}, ${l.color}cc)`,
                    boxShadow: `0 4px 12px 0 ${l.color}40`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : (
                <span className="absolute inset-0 rounded-2xl bg-card" />
              )}
              <span className="relative flex items-center gap-2">
                {l.label}
                <span
                  className="rounded-full px-2 py-0.2 text-xs font-bold"
                  style={{
                    background: active ? "rgba(255,255,255,0.25)" : "var(--muted)",
                    color: active ? "#fff" : "var(--muted-foreground)",
                  }}
                >
                  {counts[l.code] ?? 0}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {lessons === null && !error ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          Chưa có bài học nào ở cấp độ {activeLevelObj.label}.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/lessons/${l.id}`}
                className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  borderColor: `${activeLevelObj.color}25`,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* Left color bar */}
                <div
                  className="absolute inset-y-0 left-0 w-1.5"
                  style={{ background: activeLevelObj.color }}
                />

                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${activeLevelObj.color}, ${activeLevelObj.color}90)`,
                  }}
                >
                  <GraduationCap size={22} />
                </span>

                <div className="min-w-0 flex-1 pl-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: `${activeLevelObj.color}15`,
                        color: activeLevelObj.color,
                        border: `1px solid ${activeLevelObj.color}30`,
                      }}
                    >
                      {activeLevelObj.label}
                    </span>
                  </div>
                  <p className="mt-1 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {l.title}
                  </p>
                  {l.summary ? (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {l.summary}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <span className="rounded-lg bg-secondary/80 px-2 py-0.5 text-foreground">
                      📖 {l._count.vocabulary} từ vựng
                    </span>
                    <span className="rounded-lg bg-secondary/80 px-2 py-0.5 text-foreground">
                      💡 {l._count.points} điểm ngữ pháp
                    </span>
                    {l._count.exercises > 0 ? (
                      <span className="rounded-lg bg-secondary/80 px-2 py-0.5 text-foreground">
                        ✍️ {l._count.exercises} bài tập
                      </span>
                    ) : null}
                  </div>
                </div>

                <ChevronRight
                  size={20}
                  className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
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
