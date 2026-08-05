"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Mic, Play, Plus, Sparkles, Trophy } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { errorBannerClass } from "@/components/ui-kit/form-styles";
import { PageHeader } from "@/components/ui-kit/primitives";
import {
  fetchSpeakingSessions,
  speakingLevelLabel,
} from "@/lib/speaking-api";
import { learningLanguageLabel } from "@/lib/learning-language";
import type { SpeakingSessionListItem } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SpeakingHubContent() {
  const { languageCode } = useLearningLanguage();
  const [sessions, setSessions] = useState<SpeakingSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSessions(await fetchSpeakingSessions(languageCode));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [languageCode]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Luyện nói AI"
        sub={`Hội thoại theo tình huống thực tế cùng AI thông minh — ${learningLanguageLabel(languageCode)}`}
        action={
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/speaking/new"
              className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition-all"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                boxShadow: `0 4px 14px 0 ${BRAND.blue}40`,
              }}
            >
              <Plus size={15} /> Bắt đầu phiên mới
            </Link>
          </motion.div>
        }
      />

      {/* Hero Banner */}
      <section
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
        style={{
          background: `linear-gradient(135deg, ${BRAND.purple}14 0%, transparent 60%, ${BRAND.blue}14 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-3xl"
          style={{ background: `${BRAND.purple}22` }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
              boxShadow: `0 6px 20px 0 ${BRAND.purple}40`,
            }}
          >
            <Mic size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                Tương tác giọng nói thời gian thực
              </span>
            </div>
            <h2 className="text-xl font-black text-foreground sm:text-2xl">
              Luyện phản xạ giao tiếp với trợ lý AI
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-muted-foreground">
              Nhập vai vào các tình huống thực tế (gọi món, sân bay, phỏng vấn…), nói trực tiếp qua micro. AI sẽ đối thoại tự nhiên, phân tích độ lưu loát và chấm điểm chi tiết.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 shadow-2xs">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between pt-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Lịch sử phiên luyện nói ({sessions.length})
        </h3>
      </div>

      {loading ? (
        <p className="text-xs font-bold text-muted-foreground">Đang tải danh sách phiên…</p>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-10 text-center shadow-2xs">
          <p className="text-sm font-bold text-muted-foreground">
            Chưa có phiên luyện nói nào.{" "}
            <Link href="/speaking/new" className="font-black text-primary hover:underline">
              Bắt đầu phiên đầu tiên ngay →
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s, i) => {
            const score = s.overallScore;
            const color = score != null ? scoreColor(score) : BRAND.yellow;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={`/speaking/sessions/${s.id}`}
                  className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  {/* Left indicator bar */}
                  <div
                    className="absolute inset-y-0 left-0 w-1.5"
                    style={{ background: color }}
                  />

                  <div className="flex items-center gap-4 pl-1">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-2xs"
                      style={{
                        background: `linear-gradient(135deg, ${color}, ${color}90)`,
                      }}
                    >
                      <Mic size={18} />
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
                          {speakingLevelLabel(s.situation.level)}
                        </span>
                        {s.estimatedLevel ? (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                            Trình độ: {s.estimatedLevel}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-base font-black text-foreground transition-colors group-hover:text-primary">
                        {s.situation.title}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                        {formatDate(s.completedAt ?? s.startedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      {s.status === "COMPLETED" && score != null ? (
                        <span
                          className="rounded-full px-3 py-1 font-mono text-xs font-black"
                          style={{
                            background: `${color}18`,
                            color: color,
                          }}
                        >
                          {Math.round(score)} điểm
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
                          Đang làm
                        </span>
                      )}
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                    />
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

export default function SpeakingPage() {
  return (
    <AuthGate>
      <SpeakingHubContent />
    </AuthGate>
  );
}
