"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Trophy } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
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
    <div>
      <PageHeader
        title="Lịch sử làm bài TOPIK"
        sub="Xem lại các lần luyện tập và thi thử"
        action={
          <Link
            href="/topik/TOPIK_I"
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Luyện TOPIK
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {attempts === null ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có bài làm nào.</p>
      ) : (
        <div className="space-y-2">
          {attempts.map((a, i) => {
            const scores = getAttemptListScoreLines(a);
            const acc = scoreColor(a.scorePercent);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/topik/attempts/${a.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${BRAND.blue}18`, color: BRAND.blue }}
                  >
                    <Trophy size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {topikAttemptModeLabel(a.mode)}
                      {a.exam ? ` · ${a.exam.title}` : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topikTierLabel(a.tier)}
                      {a.section ? ` · ${topikSectionLabel(a.section)}` : null}
                      {a.formatFromNo != null && a.formatToNo != null
                        ? ` · câu ${a.formatFromNo}${a.formatToNo !== a.formatFromNo ? `–${a.formatToNo}` : ""}`
                        : null}
                    </p>
                    {scores.mcqLine || scores.writingLine ? (
                      <div className="mt-1 space-y-0.5 text-xs">
                        {scores.mcqLine ? (
                          <p className="text-muted-foreground">{scores.mcqLine}</p>
                        ) : null}
                        {scores.writingLine ? (
                          <p
                            style={{
                              color:
                                scores.writingTone === "emerald"
                                  ? BRAND.green
                                  : scores.writingTone === "amber"
                                    ? BRAND.yellow
                                    : BRAND.muted,
                            }}
                          >
                            {scores.writingLine}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs" style={{ color: acc }}>
                        {a.correctCount}/{a.totalQuestions} ({a.scorePercent}%)
                      </p>
                    )}
                    {a.finishedAt ? (
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {new Date(a.finishedAt).toLocaleString("vi-VN")}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground transition-colors group-hover:text-foreground"
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
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
