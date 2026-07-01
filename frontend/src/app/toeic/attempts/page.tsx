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
  toeicAttemptModeLabel,
  toeicSectionLabel,
} from "@/lib/toeic-labels";
import type { ToeicAttemptRow } from "@/lib/types";

function AttemptsContent() {
  const [attempts, setAttempts] = useState<ToeicAttemptRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/toeic/attempts");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setAttempts((await res.json()) as ToeicAttemptRow[]);
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
        title="Lịch sử làm bài TOEIC"
        sub="Xem lại các lần luyện Part và thi thử"
        action={
          <Link
            href="/toeic/TOEIC_LR"
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Luyện TOEIC
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
            const acc = scoreColor(a.scorePercent);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/toeic/attempts/${a.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg,${BRAND.purple}20,${BRAND.blue}20)`,
                      color: BRAND.purple,
                    }}
                  >
                    <Trophy size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {a.exam?.title ??
                        (a.section
                          ? `${toeicAttemptModeLabel(a.mode)} · ${toeicSectionLabel(a.section)}`
                          : toeicAttemptModeLabel(a.mode))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.finishedAt
                        ? new Date(a.finishedAt).toLocaleString("vi-VN")
                        : "—"}
                      {" · "}
                      {a.correctCount}/{a.totalQuestions} đúng
                    </p>
                  </div>
                  <span
                    className="rounded px-2 py-0.5 font-mono text-sm font-bold"
                    style={{ color: acc, backgroundColor: `${acc}18` }}
                  >
                    {a.scorePercent}%
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
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

export default function ToeicAttemptsPage() {
  return (
    <AuthGate>
      <AttemptsContent />
    </AuthGate>
  );
}
