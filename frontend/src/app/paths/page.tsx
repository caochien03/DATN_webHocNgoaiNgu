"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Route } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND } from "@/components/ui-kit/brand";
import { Bar, PageHeader } from "@/components/ui-kit/primitives";
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
    <div>
      <PageHeader
        title="Lộ trình học"
        sub="Theo từng bước từ từ vựng nền tảng tới bài học ngữ pháp"
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {paths === null && !error ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : null}

      {paths ? (
        <div className="space-y-3">
          {paths.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={`/paths/${p.id}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${BRAND.yellow}18`, color: BRAND.yellow }}
                    >
                      <Route size={18} />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{p.title}</p>
                      {p.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.level ?? p.languageCode.toUpperCase()} ·{" "}
                        {p.completedSteps}/{p.totalSteps} bước
                      </p>
                    </div>
                  </div>
                  <span
                    className="shrink-0 font-mono text-sm font-semibold"
                    style={{ color: BRAND.blue }}
                  >
                    {p.percent}%
                  </span>
                </div>
                <div className="mt-3">
                  <Bar done={p.completedSteps} total={p.totalSteps || 1} color={BRAND.blue} />
                </div>
              </Link>
            </motion.div>
          ))}
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
