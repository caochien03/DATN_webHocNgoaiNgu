"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, levelColor } from "@/components/ui-kit/brand";
import { LevelBadge, PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import type { TopicRow } from "@/lib/types";

function TopicsContent() {
  const { languageCode } = useLearningLanguage();
  const [topics, setTopics] = useState<TopicRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState("Tất cả");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/topics", languageCode),
      );
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setTopics((await res.json()) as TopicRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được chủ đề");
    }
  }, [languageCode]);

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
            : "Chọn một chủ đề để khám phá từ vựng và bắt đầu học"
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
                className="relative rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors"
                style={{
                  color: active ? "#fff" : "var(--foreground)",
                  border: active ? "none" : "1px solid var(--border)",
                  background: active ? undefined : "var(--card)",
                  boxShadow: active ? undefined : "var(--shadow-card)",
                }}
              >
                {active ? (
                  <motion.span
                    layoutId="topic-filter"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `linear-gradient(90deg,${BRAND.blue},${BRAND.cyan})` }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
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
          Chưa có chủ đề phù hợp với ngôn ngữ hoặc cấp độ đang chọn.
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
                  className="group block rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40"
                  style={{ boxShadow: "var(--shadow-card)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "var(--shadow-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "var(--shadow-card)";
                  }}
                >
                  <div className="mb-4 flex items-start justify-between">
                    {/* Icon thay thế chữ cái */}
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      <BookOpen size={22} strokeWidth={2} />
                    </span>
                    {t.level ? <LevelBadge level={t.level} /> : null}
                  </div>

                  <p className="truncate text-lg font-bold text-foreground">
                    {t.title}
                  </p>
                  {t.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t._count.words} từ vựng
                    </p>
                  )}
                  <p className="mt-4 text-xs font-semibold" style={{ color }}>
                    {t._count.words} từ →
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
