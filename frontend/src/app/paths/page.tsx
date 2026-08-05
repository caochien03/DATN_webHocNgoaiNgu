"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Route, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND } from "@/components/ui-kit/brand";
import { Bar, PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import { learningLanguageLabel } from "@/lib/learning-language";
import type { LearningPathRow } from "@/lib/types";

const PALETTE = [BRAND.blue, BRAND.cyan, BRAND.purple, BRAND.green] as const;

function PathsContent() {
  const { languageCode } = useLearningLanguage();
  const [paths, setPaths] = useState<LearningPathRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/paths", languageCode),
      );
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setPaths((await res.json()) as LearningPathRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được lộ trình");
    }
  }, [languageCode]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lộ trình học"
        sub={`Học từng bước từ cơ bản đến nâng cao theo giáo trình chuẩn — ${learningLanguageLabel(languageCode)}`}
      />

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 shadow-2xs">
          {error}
        </p>
      ) : null}

      {paths === null && !error ? (
        <p className="text-xs font-bold text-muted-foreground">Đang tải lộ trình…</p>
      ) : null}

      {paths ? (
        <div className="space-y-4">
          {paths.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-10 text-center shadow-2xs">
              <p className="text-sm font-bold text-muted-foreground">
                Chưa có lộ trình học nào cho ngôn ngữ này.
              </p>
            </div>
          ) : (
            paths.map((p, i) => {
              const color = PALETTE[i % PALETTE.length];
              const isCompleted = p.percent === 100;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -3 }}
                >
                  <Link
                    href={`/paths/${p.id}`}
                    className="group relative block overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    {/* Top gradient line */}
                    <div
                      className="absolute inset-x-0 top-0 h-[2.5px]"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}40)`,
                      }}
                    />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                            boxShadow: `0 4px 14px 0 ${color}35`,
                          }}
                        >
                          <Route size={22} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                              style={{
                                background: `${color}15`,
                                color: color,
                                border: `1px solid ${color}30`,
                              }}
                            >
                              {p.level ?? p.languageCode.toUpperCase()}
                            </span>
                            {isCompleted ? (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={12} /> Đã hoàn thành
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-base font-black text-foreground transition-colors group-hover:text-primary">
                            {p.title}
                          </p>
                          {p.description ? (
                            <p className="mt-1 line-clamp-2 text-xs font-medium text-muted-foreground">
                              {p.description}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between sm:flex-col sm:items-end gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{
                            background: isCompleted ? "rgba(5, 150, 105, 0.15)" : `${color}18`,
                            color: isCompleted ? BRAND.green : color,
                          }}
                        >
                          {p.percent}% hoàn thành
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {p.completedSteps}/{p.totalSteps} bước học
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Bar done={p.completedSteps} total={p.totalSteps || 1} color={color} />
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
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
