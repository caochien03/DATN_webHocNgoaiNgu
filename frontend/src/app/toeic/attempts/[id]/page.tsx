"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, GRADIENT, scoreColor } from "@/components/ui-kit/brand";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import {
  toeicAttemptModeLabel,
  toeicSectionLabel,
} from "@/lib/toeic-labels";
import type { GradedToeicAnswer, ToeicAttemptRow } from "@/lib/types";

type AttemptDetail = ToeicAttemptRow & {
  answers: GradedToeicAnswer[];
};

function AttemptDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetchWithAuth(`/toeic/attempts/${id}`);
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

  if (loadError) {
    return (
      <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {loadError}
      </p>
    );
  }

  if (!attempt) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }

  const answers = attempt.answers ?? [];
  const acc = scoreColor(attempt.scorePercent);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/toeic/attempts"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Lịch sử
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">
        {toeicAttemptModeLabel(attempt.mode)}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {attempt.exam?.title ??
          (attempt.section
            ? toeicSectionLabel(attempt.section)
            : "TOEIC LR")}
        {attempt.formatFromNo != null && attempt.formatToNo != null
          ? ` · câu ${attempt.formatFromNo}–${attempt.formatToNo}`
          : ""}
      </p>

      <div
        className="mt-6 rounded-2xl border border-border p-6 text-center"
        style={{ borderColor: `${acc}40` }}
      >
        <p className="text-4xl font-bold" style={{ color: acc }}>
          {attempt.scorePercent}%
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {attempt.correctCount}/{attempt.totalQuestions} câu đúng
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {answers.map((a) => {
          const ok = a.isCorrect;
          const color = ok ? BRAND.green : BRAND.red;
          return (
            <div
              key={a.questionId}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {toeicSectionLabel(a.section)} · câu {a.questionNo}
                </span>
                <span
                  className="rounded px-2 py-0.5 text-xs font-semibold"
                  style={{ color, backgroundColor: `${color}18` }}
                >
                  {ok ? "Đúng" : "Sai"}
                </span>
              </div>
              <p className="text-sm text-foreground">
                Bạn chọn: <strong>{String.fromCharCode(65 + a.selectedIndex)}</strong>
                {!ok ? (
                  <>
                    {" "}
                    · Đáp án:{" "}
                    <strong>{String.fromCharCode(65 + a.correctIndex)}</strong>
                  </>
                ) : null}
              </p>
              {a.explanation ? (
                <p className="mt-2 text-xs text-muted-foreground">{a.explanation}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <Link
        href="/toeic/TOEIC_LR"
        className="mt-8 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
        style={{ background: GRADIENT }}
      >
        Luyện tiếp
      </Link>
    </div>
  );
}

export default function ToeicAttemptDetailPage() {
  return (
    <AuthGate>
      <AttemptDetailContent />
    </AuthGate>
  );
}
