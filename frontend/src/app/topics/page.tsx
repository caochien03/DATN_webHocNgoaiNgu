"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, levelColor } from "@/components/ui-kit/brand";
import { LevelBadge, PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { TopicRow } from "@/lib/types";

function TopicsContent() {
  const [topics, setTopics] = useState<TopicRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState("Tất cả");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/topics?language=ko");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setTopics((await res.json()) as TopicRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được chủ đề");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const levels = useMemo(() => {
    const set = new Set<string>();
    (topics ?? []).forEach((t) => {
      if (t.level) set.add(t.level);
    });
    return ["Tất cả", ...Array.from(set).sort()];
  }, [topics]);

  const filtered = useMemo(() => {
    if (!topics) return [];
    return level === "Tất cả" ? topics : topics.filter((t) => t.level === level);
  }, [topics, level]);

  const totalWords = (topics ?? []).reduce((a, t) => a + t._count.words, 0);

  return (
    <div>
      <PageHeader
        title="Từ vựng theo chủ đề"
        sub={
          topics
            ? `${topics.length} chủ đề · ${totalWords} từ`
            : "Chọn chủ đề để học và sao chép vào bộ cá nhân"
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {levels.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {levels.map((l) => {
            const active = level === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className="relative rounded-xl px-4 py-1.5 text-sm font-medium"
                style={{ color: active ? "#fff" : BRAND.muted }}
              >
                {active ? (
                  <motion.span
                    layoutId="topic-filter"
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
                <span className="relative">{l}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {topics === null ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có chủ đề nào. Hãy chạy seed lại ở backend.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => {
            const color = t.level ? levelColor(t.level) : BRAND.blue;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <Link
                  href={`/topics/${t.id}`}
                  className="group block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {t.title.charAt(0)}
                    </span>
                    {t.level ? <LevelBadge level={t.level} /> : null}
                  </div>
                  <p className="truncate text-lg font-bold text-foreground">
                    {t.title}
                  </p>
                  {t.description ? (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t._count.words} từ vựng
                    </p>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground">
                    {t._count.words} từ
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TopicsPage() {
  return (
    <AuthGate>
      <TopicsContent />
    </AuthGate>
  );
}
