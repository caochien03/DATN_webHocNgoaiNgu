"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Mic, Plus } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { scoreColor } from "@/components/ui-kit/brand";
import { errorBannerClass } from "@/components/ui-kit/form-styles";
import { Card, GradientButton, PageHeader } from "@/components/ui-kit/primitives";
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
    <div>
      <PageHeader
        title="Luyện nói"
        sub={`Hội thoại theo tình huống — ${learningLanguageLabel(languageCode)}`}
        action={
          <Link href="/speaking/new">
            <GradientButton className="inline-flex items-center gap-2">
              <Plus size={16} />
              Bắt đầu phiên mới
            </GradientButton>
          </Link>
        }
      />

      <Card className="mb-8 p-5">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mic size={22} />
          </div>
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chọn chủ đề quen thuộc, vào một tình huống (đặt bàn, hỏi đường…),
              nói bằng {learningLanguageLabel(languageCode).toLowerCase()} qua
              micro. Hệ thống nhận diện giọng nói, đóng vai nhân vật hội thoại
              và đánh giá theo mục tiêu giao tiếp.
            </p>
          </div>
        </div>
      </Card>

      {error ? (
        <p className={`${errorBannerClass} mb-4`}>{error}</p>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold text-foreground">Phiên gần đây</h2>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : sessions.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Chưa có phiên nào.{" "}
          <Link href="/speaking/new" className="text-primary underline">
            Bắt đầu luyện nói
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const score = s.overallScore;
            return (
              <li key={s.id}>
                <Link
                  href={`/speaking/sessions/${s.id}`}
                  className="block rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:bg-muted/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {s.situation.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {speakingLevelLabel(s.situation.level)} ·{" "}
                        {formatDate(s.completedAt ?? s.startedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      {s.status === "COMPLETED" && score != null ? (
                        <p
                          className="text-lg font-bold"
                          style={{ color: scoreColor(score) }}
                        >
                          {Math.round(score)}
                        </p>
                      ) : (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                          Đang làm
                        </span>
                      )}
                      {s.estimatedLevel ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {s.estimatedLevel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
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
