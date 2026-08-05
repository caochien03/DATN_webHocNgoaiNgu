"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
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
    <div className="space-y-6">
      <PageHeader
        title="Từ vựng theo chủ đề"
        sub={
          topics
            ? `${topics.length} chủ đề phong phú · ${totalWords} từ vựng chuẩn`
            : "Chọn một chủ đề để khám phá từ vựng và bắt đầu luyện phản xạ"
        }
      />

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 shadow-2xs">
          {error}
        </p>
      ) : null}

      {/* Level Pills */}
      {levels.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {levels.map((l) => {
            const active = level === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className="relative rounded-2xl px-4 py-2 text-xs font-black transition-all shadow-2xs"
                style={{
                  color: active ? "#fff" : "var(--foreground)",
                  border: active ? "none" : "1px solid var(--border)",
                  background: active ? undefined : "var(--card)",
                }}
              >
                {active ? (
                  <motion.span
                    layoutId="topic-filter"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                      boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{l}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {topics === null ? (
        <p className="text-xs font-bold text-muted-foreground">Đang tải danh sách chủ đề…</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs font-bold text-muted-foreground">
          Chưa có chủ đề phù hợp với ngôn ngữ hoặc cấp độ đang chọn.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => {
            const color = t.level ? levelColor(t.level) : BRAND.blue;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  href={`/topics/${t.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md h-full"
                >
                  {/* Top accent line */}
                  <div
                    className="absolute inset-x-0 top-0 h-[2.5px]"
                    style={{
                      background: `linear-gradient(90deg, ${color}, ${color}40)`,
                    }}
                  />

                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                          color,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        <BookOpen size={20} strokeWidth={2.2} />
                      </span>
                      {t.level ? <LevelBadge level={t.level} /> : null}
                    </div>

                    <p className="truncate text-base font-black tracking-tight text-foreground">
                      {t.title}
                    </p>
                    {t.description ? (
                      <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground">
                        {t.description}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                        Chủ đề chứa các từ vựng thiết yếu
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-xs font-black text-muted-foreground">
                      {t._count.words} từ vựng
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-black transition-transform group-hover:translate-x-1"
                      style={{ color }}
                    >
                      <span>Học ngay</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
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
