"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Route } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-fetch";
import { BRAND, GRADIENT_DIAGONAL } from "@/components/ui-kit/brand";

type RequirementsStatus = {
  vocabRequired: boolean;
  vocabPassed: boolean;
  vocabBestScore: number | null;
  grammarRequired: boolean;
  grammarPassed: boolean;
  grammarBestScore: number | null;
  allPassed: boolean;
};

type StepStatus = {
  stepId: string;
  pathId: string;
  pathTitle: string;
  completed: boolean;
};

type SourceStatusResponse = {
  inPath: boolean;
  completed: boolean;
  requirements?: RequirementsStatus;
  steps: StepStatus[];
};

type PathStepStatusCardProps = {
  sourceType: "LESSON" | "TOPIC";
  sourceId: string;
};

export function PathStepStatusCard({ sourceType, sourceId }: PathStepStatusCardProps) {
  const [status, setStatus] = useState<SourceStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `/paths/source-status?sourceType=${sourceType}&sourceId=${sourceId}`
      );
      if (res.ok) {
        const data = (await res.json()) as SourceStatusResponse;
        setStatus(data);
      }
    } catch {
      // Bỏ qua nếu lỗi mạng
    } finally {
      setLoading(false);
    }
  }, [sourceType, sourceId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (loading || !status || !status.inPath) {
    return null;
  }

  const req = status.requirements;
  const pathTitles = Array.from(new Set(status.steps.map((s) => s.pathTitle))).join(", ");
  const isCompleted = status.completed || (req ? req.allPassed : false);

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-primary/25 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md shadow-primary/20"
            style={{ background: isCompleted ? BRAND.green : GRADIENT_DIAGONAL }}
          >
            {isCompleted ? <CheckCircle2 size={24} /> : <Route size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Lộ trình học tập
              </span>
              <span className="text-xs text-muted-foreground">• {pathTitles}</span>
            </div>
            <h3 className="text-base font-bold text-foreground sm:text-lg">
              {isCompleted
                ? "🎉 Bạn đã hoàn thành bước này trong lộ trình!"
                : "Điều kiện hoàn thành bước trong Lộ trình"}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isCompleted
                ? "Tiến độ trong lộ trình đã được cập nhật thành công (Đạt ≥ 80% các phần bắt buộc)."
                : "Để hệ thống tự động tích xanh bước này, bạn cần đạt tối thiểu 80% điểm ở các phần bên dưới:"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
          <Link
            href="/paths"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Xem lộ trình →
          </Link>
        </div>
      </div>

      {/* Checklist tiêu chí hoàn thành */}
      {req && !isCompleted ? (
        <div className="mt-5 grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2">
          {/* Tiêu chí 1: Từ vựng */}
          {req.vocabRequired ? (
            <div
              className="flex items-center justify-between rounded-2xl border p-3.5 text-xs transition-colors"
              style={{
                backgroundColor: req.vocabPassed
                  ? "rgba(16, 185, 129, 0.08)"
                  : "rgba(245, 158, 11, 0.08)",
                borderColor: req.vocabPassed
                  ? "rgba(16, 185, 129, 0.25)"
                  : "rgba(245, 158, 11, 0.25)",
              }}
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span>{req.vocabPassed ? "✅" : "⏳"}</span>
                  <span>1. Từ vựng (Trắc nghiệm hoặc Luyện viết)</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Yêu cầu: ≥ 80% điểm • Điểm cao nhất:{" "}
                  <strong className="text-foreground">
                    {req.vocabBestScore !== null ? `${req.vocabBestScore}%` : "Chưa làm"}
                  </strong>
                </p>
              </div>

              {!req.vocabPassed ? (
                <Link
                  href={
                    sourceType === "LESSON"
                      ? `/lessons/${sourceId}/learn`
                      : `/topics/${sourceId}/learn`
                  }
                  className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})` }}
                >
                  Luyện ngay →
                </Link>
              ) : null}
            </div>
          ) : null}

          {/* Tiêu chí 2: Ngữ pháp (Dành cho Bài học) */}
          {sourceType === "LESSON" && req.grammarRequired ? (
            <div
              className="flex items-center justify-between rounded-2xl border p-3.5 text-xs transition-colors"
              style={{
                backgroundColor: req.grammarPassed
                  ? "rgba(16, 185, 129, 0.08)"
                  : "rgba(245, 158, 11, 0.08)",
                borderColor: req.grammarPassed
                  ? "rgba(16, 185, 129, 0.25)"
                  : "rgba(245, 158, 11, 0.25)",
              }}
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span>{req.grammarPassed ? "✅" : "⏳"}</span>
                  <span>2. Ngữ pháp (Luyện tập bài tập)</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Yêu cầu: ≥ 80% điểm • Điểm cao nhất:{" "}
                  <strong className="text-foreground">
                    {req.grammarBestScore !== null ? `${req.grammarBestScore}%` : "Chưa làm"}
                  </strong>
                </p>
              </div>

              {!req.grammarPassed ? (
                <Link
                  href={`/lessons/${sourceId}/practice`}
                  className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})` }}
                >
                  Luyện ngay →
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
