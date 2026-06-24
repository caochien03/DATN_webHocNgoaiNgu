"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopikExamRunner } from "@/components/topik/TopikExamRunner";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { TopikAnswerPayload } from "@/lib/topik-answers";
import { formatSectionCounts } from "@/lib/topik-exam-sections";
import type { TopikExamTake, TopikSubmitResult } from "@/lib/types";

function ExamTakeContent() {
  const params = useParams();
  const id = params.id as string;
  const [exam, setExam] = useState<TopikExamTake | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/topik/exams/${id}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExam((await res.json()) as TopikExamTake);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được đề thi");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(
    answers: TopikAnswerPayload[],
  ): Promise<TopikSubmitResult> {
    const res = await fetchWithAuth(`/topik/exams/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    return (await res.json()) as TopikSubmitResult;
  }

  const sectionHint =
    exam?.sectionCounts && Object.keys(exam.sectionCounts).length > 0
      ? formatSectionCounts(exam.sectionCounts)
      : null;

  if (error) {
    return (
      <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {error}
      </p>
    );
  }

  if (!exam) {
    return <p className="text-sm text-muted-foreground">Đang tải đề thi…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <TopikExamRunner
        title={exam.title}
        subtitle={[
          sectionHint,
          `${exam.questionCount} câu`,
          `${exam.durationMinutes} phút`,
        ]
          .filter(Boolean)
          .join(" · ")}
        durationMinutes={exam.durationMinutes}
        questions={exam.questions}
        backHref={`/topik/${exam.tier}`}
        onSubmit={submit}
      />
    </div>
  );
}

export default function TopikExamPage() {
  return (
    <AuthGate>
      <ExamTakeContent />
    </AuthGate>
  );
}
