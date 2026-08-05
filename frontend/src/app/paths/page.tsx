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
    <div>
      <PageHeader
        title="Lộ trình học"
        sub={`Học từng bước từ cơ bản đến nâng cao — ${learningLanguageLabel(languageCode)}`}
      />

      {error ? (
        <p className="mb-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {paths === null && !error ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : null}

      {paths ? (
        <div className="space-y-4">
          {paths.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
              Chưa có lộ trình học nào cho ngôn ngữ này.
            </div>
          ) : (
            paths.map((p, i) => {
              const color = PALETTE[i % PALETTE.length];
              const isCompleted = p.percent === 100;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={`/paths/${p.id}`}
                    className="group relative block overflow-hidden rounded-3xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      borderColor: `${color}30`,
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {/* Top gradient line */}
                    <div
                      className="absolute inset-x-0 top-0 h-[3px]"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}50)`,
                      }}
                    />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${color}, ${color}90)`,
                          }}
                        >
                          <Route size={22} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                background: `${color}15`,
                                color: color,
                                border: `1px solid ${color}30`,
                              }}
                            >
                              {p.level ?? p.languageCode.toUpperCase()}
                            </span>
                            {isCompleted ? (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                <CheckCircle2 size={12} /> Đã hoàn thành
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {p.title}
                          </p>
                          {p.description ? (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {p.description}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between sm:flex-col sm:items-end gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-extrabold"
                          style={{
                            background: isCompleted ? "rgba(16, 185, 129, 0.15)" : `${color}18`,
                            color: isCompleted ? "#10b981" : color,
                          }}
                        >
                          {p.percent}% hoàn thành
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {p.completedSteps}/{p.totalSteps} bước
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
