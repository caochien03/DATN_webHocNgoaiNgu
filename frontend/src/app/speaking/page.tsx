"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Mic, Play, Plus, Sparkles, Trophy } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, GRADIENT, GRADIENT_DIAGONAL, scoreColor } from "@/components/ui-kit/brand";
import { errorBannerClass } from "@/components/ui-kit/form-styles";
import { Card, PageHeader } from "@/components/ui-kit/primitives";
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
    <div className="pb-10">
      <PageHeader
        title="Luyện nói AI"
        sub={`Hội thoại theo tình huống thực tế — ${learningLanguageLabel(languageCode)}`}
        action={
          <Link
            href="/speaking/new"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
            }}
          >
            <Plus size={16} /> Bắt đầu phiên mới
          </Link>
        }
      />

      {/* Hero Banner */}
      <section
        className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
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
            style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})` }}
          >
            <Mic size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Tương tác giọng nói trực tiếp</span>
            </div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Luyện phản xạ giao tiếp với trợ lý AI
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Vào các tình huống thực tế (gọi món, hỏi đường, mua sắm…), nói qua micro bằng {learningLanguageLabel(languageCode).toLowerCase()}.
              AI sẽ đóng vai đối thoại, nhận diện phát âm và chấm điểm chi tiết.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <p className={`${errorBannerClass} mb-4`}>{error}</p>
      ) : null}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Lịch sử</span>
          <h3 className="mt-1 text-lg font-bold text-foreground">Phiên luyện gần đây</h3>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách phiên…</p>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          Chưa có phiên luyện nói nào.{" "}
          <Link href="/speaking/new" className="font-bold text-primary hover:underline">
            Bắt đầu phiên đầu tiên ngay →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const score = s.overallScore;
            const color = score != null ? scoreColor(score) : BRAND.yellow;
            return (
              <Link
                key={s.id}
                href={`/speaking/sessions/${s.id}`}
                className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  borderColor: `${color}25`,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* Left indicator bar */}
                <div
                  className="absolute inset-y-0 left-0 w-1.5"
                  style={{ background: color }}
                />

                <div className="flex items-center gap-4 pl-1">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}85)`,
                    }}
                  >
                    <Mic size={20} />
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
                        {speakingLevelLabel(s.situation.level)}
                      </span>
                      {s.estimatedLevel ? (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          Trình độ: {s.estimatedLevel}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {s.situation.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(s.completedAt ?? s.startedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <div className="text-right">
                    {s.status === "COMPLETED" && score != null ? (
                      <div>
                        <span
                          className="rounded-full px-3 py-1 font-mono text-sm font-black"
                          style={{
                            background: `${color}18`,
                            color: color,
                          }}
                        >
                          {Math.round(score)} điểm
                        </span>
                      </div>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-500">
                        Đang làm
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                  />
                </div>
              </Link>
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
