"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { WritingGradeView, WritingResultSummary } from "@/components/topik/WritingGradeView";
import { WritingSubmitOverlay } from "@/components/topik/WritingSubmitOverlay";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import {
  topikAttemptModeLabel,
  topikSectionLabel,
  topikTierLabel,
} from "@/lib/topik-labels";
import {
  summarizeWritingGrades,
  writingGradeCardClass,
  writingGradeTitleSuffix,
  writingGradeUiStatus,
} from "@/lib/topik-writing-grade-status";
import type { GradedTopikAnswer, TopikAttemptRow } from "@/lib/types";

type AttemptDetail = TopikAttemptRow & {
  answers: GradedTopikAnswer[];
};

function AttemptDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [regradeError, setRegradeError] = useState<string | null>(null);
  const [regrading, setRegrading] = useState(false);
  const [regradeNote, setRegradeNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetchWithAuth(`/topik/attempts/${id}`);
      if (!res.ok) {
        setLoadError(await parseApiError(res));
        return;
      }
      setAttempt((await res.json()) as AttemptDetail);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Không tải được chi tiết");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function regradeWriting() {
    setRegrading(true);
    setRegradeError(null);
    setRegradeNote(null);
    try {
      const res = await fetchWithAuth(`/topik/attempts/${id}/regrade-writing`, {
        method: "POST",
      });
      if (!res.ok) {
        setRegradeError(await parseApiError(res));
        return;
      }
      const data = (await res.json()) as AttemptDetail & {
        regradedCount?: number;
        stillPendingCount?: number;
      };
      setAttempt(data);
      const graded = data.regradedCount ?? 0;
      const still = data.stillPendingCount ?? 0;
      if (graded > 0 && still === 0) {
        setRegradeNote(`Đã chấm xong ${graded} câu viết.`);
      } else if (graded > 0) {
        setRegradeNote(
          `Đã chấm ${graded} câu; ${still} câu vẫn chưa chấm được — thử lại sau.`,
        );
      } else {
        setRegradeNote("Chưa chấm được câu nào — kiểm tra cấu hình Gemini trên server.");
      }
    } catch (e) {
      setRegradeError(e instanceof Error ? e.message : "Không chấm lại được");
    } finally {
      setRegrading(false);
    }
  }

  if (loadError) {
    return <p className="px-4 py-8 text-sm text-red-600">{loadError}</p>;
  }

  if (!attempt) {
    return <p className="px-4 py-8 text-sm text-zinc-500">Đang tải…</p>;
  }

  const answers = attempt.answers ?? [];
  const writingSummary = summarizeWritingGrades(answers);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <WritingSubmitOverlay
        visible={regrading}
        hasWriting
        writingCount={writingSummary.pendingCount}
      />
      <Link
        href="/topik/attempts"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Lịch sử
      </Link>
      <h1 className="mt-4 text-xl font-semibold">
        {topikAttemptModeLabel(attempt.mode)}
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {topikTierLabel(attempt.tier)}
        {attempt.exam ? ` · ${attempt.exam.title}` : null}
        {writingSummary.writingCount === 0 ? (
          <>
            {" · "}
            {attempt.correctCount}/{attempt.totalQuestions} ({attempt.scorePercent}
            %)
          </>
        ) : null}
      </p>
      {writingSummary.writingCount > 0 ? (
        <WritingResultSummary
          answers={answers}
          mcqLine={{
            correctCount: attempt.correctCount,
            totalQuestions: attempt.totalQuestions,
            scorePercent: attempt.scorePercent,
          }}
        />
      ) : null}

      {writingSummary.pendingCount > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={regrading}
            onClick={() => void regradeWriting()}
            className="rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {regrading ? "Đang chấm…" : "Chấm lại bằng AI"}
          </button>
          <p className="text-xs text-zinc-500">
            {writingSummary.pendingCount} câu viết chưa có điểm AI
          </p>
        </div>
      ) : null}

      {regradeNote ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{regradeNote}</p>
      ) : null}

      {regradeError ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{regradeError}</p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-3">
        {answers.map((a) => {
          const uiStatus = writingGradeUiStatus(a);
          const isMcq = uiStatus === "mcq";
          return (
          <li
            key={a.questionId}
            className={`rounded-lg border p-3 text-sm ${
              isMcq
                ? a.isCorrect
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                  : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                : writingGradeCardClass(uiStatus)
            }`}
          >
            <p className="font-medium">
              {topikSectionLabel(a.section)} câu {a.questionNo}{" "}
              {isMcq
                ? a.isCorrect
                  ? "✓"
                  : "✗"
                : writingGradeTitleSuffix(a)}
            </p>
            {a.writingPartResults?.length ? (
              <ul className="mt-2 flex flex-col gap-2">
                {a.writingPartResults.map((part) => (
                  <li key={part.label} className="text-sm">
                    <span className="font-medium">{part.label}</span>
                    <p className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                      {part.textAnswer}
                    </p>
                    {part.modelAnswer ? (
                      <p className="mt-1 text-xs text-zinc-500">
                        Mẫu: {part.modelAnswer}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {a.textAnswer ? (
              <p className="mt-2 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {a.textAnswer}
              </p>
            ) : null}
            {isMcq && a.selectedIndex != null && a.correctIndex != null ? (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Bạn chọn: {a.selectedIndex + 1} · Đúng: {a.correctIndex + 1}
              </p>
            ) : null}
            {a.modelAnswer ? (
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                Đáp án mẫu: {a.modelAnswer}
              </p>
            ) : null}
            <WritingGradeView answer={a} />
            {a.explanation ? (
              <p className="mt-1 text-xs">{a.explanation}</p>
            ) : null}
          </li>
        );})}
      </ul>
    </div>
  );
}

export default function TopikAttemptDetailPage() {
  return (
    <AuthGate>
      <AttemptDetailContent />
    </AuthGate>
  );
}
