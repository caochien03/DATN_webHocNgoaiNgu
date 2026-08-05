"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, GraduationCap, ArrowRight, BookOpen, Layers } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND } from "@/components/ui-kit/brand";
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
    <div className="space-y-6">
      <PageHeader
        title="Bài học ngữ pháp"
        sub="Mỗi bài học gồm từ vựng trọng tâm, cấu trúc ngữ pháp chi tiết và bài tập củng cố"
      />

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 shadow-2xs">
          {error}
        </p>
      ) : null}

      {/* Level filter tabs */}
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => {
          const active = level === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLevel(l.code)}
              className="relative rounded-2xl px-4 py-2 text-xs font-black transition-all shadow-2xs"
              style={{
                color: active ? "#ffffff" : "var(--foreground)",
                border: active ? "none" : "1px solid var(--border)",
                background: active ? undefined : "var(--card)",
              }}
            >
              {active ? (
                <motion.span
                  layoutId="lesson-filter"
                  className="absolute inset-0 rounded-2xl shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${l.color}, ${l.color}cc)`,
                    boxShadow: `0 4px 14px 0 ${l.color}40`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10 flex items-center gap-2">
                {l.label}
                <span
                  className="rounded-full px-2 py-0.2 text-[10px] font-black"
                  style={{
                    background: active ? "rgba(255,255,255,0.25)" : "var(--secondary)",
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

      {lessons === null ? (
        <p className="text-xs font-bold text-muted-foreground">Đang tải bài học…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-10 text-center shadow-2xs">
          <p className="text-sm font-bold text-muted-foreground">
            Chưa có bài học nào trong cấp độ {activeLevelObj.label}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href={`/lessons/${l.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md h-full"
              >
                {/* Top accent line */}
                <div
                  className="absolute inset-x-0 top-0 h-[2.5px]"
                  style={{
                    background: `linear-gradient(90deg, ${activeLevelObj.color}, ${activeLevelObj.color}40)`,
                  }}
                />

                <div>
                  <div className="mb-4 flex items-start justify-between">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${activeLevelObj.color}20, ${activeLevelObj.color}10)`,
                        color: activeLevelObj.color,
                        border: `1px solid ${activeLevelObj.color}30`,
                      }}
                    >
                      <GraduationCap size={20} strokeWidth={2.2} />
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-black"
                      style={{
                        background: `${activeLevelObj.color}15`,
                        color: activeLevelObj.color,
                        border: `1px solid ${activeLevelObj.color}30`,
                      }}
                    >
                      Bài {l.sortOrder + 1}
                    </span>
                  </div>

                  <p className="text-base font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {l.title}
                  </p>
                  {l.summary ? (
                    <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
                      {l.summary}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                      Điểm ngữ pháp quan trọng cần nắm vững
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <span>{l._count.points} điểm ngữ pháp</span>
                    <span>·</span>
                    <span>{l._count.vocabulary} từ</span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-black transition-transform group-hover:translate-x-1"
                    style={{ color: activeLevelObj.color }}
                  >
                    <span>Vào học</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
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
