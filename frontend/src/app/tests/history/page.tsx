"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, scoreColor } from "@/components/ui-kit/brand";
import { PageHeader, Stat } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import { learningLanguageLabel } from "@/lib/learning-language";
import type { QuizAttempt } from "@/lib/types";

function label(sourceType: QuizAttempt["sourceType"]): string {
  if (sourceType === "DECK") return "Bộ từ";
  if (sourceType === "TOPIC") return "Chủ đề";
  if (sourceType === "LESSON") return "Bài học";
  return "Lộ trình";
}

function TestsHistoryContent() {
  const { languageCode } = useLearningLanguage();
  const [attempts, setAttempts] = useState<QuizAttempt[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/quiz-attempts", languageCode),
      );
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setAttempts((await res.json()) as QuizAttempt[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được lịch sử");
    }
  }, [languageCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const avgScore = useMemo(() => {
    if (!attempts || attempts.length === 0) return 0;
    const total = attempts.reduce((sum, a) => sum + a.scorePercent, 0);
    return Math.round(total / attempts.length);
  }, [attempts]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Lịch sử kiểm tra"
        sub={`Các lần làm bài kiểm tra — ${learningLanguageLabel(languageCode)}`}
        action={
          <Link
            href="/tests"
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Làm bài mới
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {attempts === null ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <Stat
              label="Số lần làm"
              value={attempts.length}
              icon={<CheckCircle2 size={18} />}
              color={BRAND.blue}
              delay={0.05}
            />
            <Stat
              label="Điểm trung bình"
              value={`${avgScore}%`}
              icon={<BarChart3 size={18} />}
              color={BRAND.cyan}
              delay={0.1}
            />
          </div>

          {attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bạn chưa có lần kiểm tra nào.
            </p>
          ) : (
            <div className="space-y-2">
              {attempts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {a.sourceTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {label(a.sourceType)} ·{" "}
                      {new Date(a.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <p
                    className="shrink-0 font-mono text-sm font-bold"
                    style={{ color: scoreColor(a.scorePercent) }}
                  >
                    {a.correctAnswers}/{a.totalQuestions} ({a.scorePercent}%)
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TestsHistoryPage() {
  return (
    <AuthGate>
      <TestsHistoryContent />
    </AuthGate>
  );
}
