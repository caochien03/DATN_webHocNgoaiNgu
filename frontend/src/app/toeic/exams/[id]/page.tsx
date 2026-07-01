"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopikExamRunner } from "@/components/topik/TopikExamRunner";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { TopikAnswerPayload } from "@/lib/topik-answers";
import { formatToeicSectionCounts } from "@/lib/toeic-exam-sections";
import type { ExamMcqSubmitResult, ToeicExamTake } from "@/lib/types";

function ExamTakeContent() {
  const params = useParams();
  const id = params.id as string;
  const [exam, setExam] = useState<ToeicExamTake | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/toeic/exams/${id}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExam((await res.json()) as ToeicExamTake);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được đề thi");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(
    answers: TopikAnswerPayload[],
  ): Promise<ExamMcqSubmitResult> {
    const mcqAnswers = answers
      .filter((a) => a.selectedIndex !== undefined)
      .map((a) => ({
        questionId: a.questionId,
        selectedIndex: a.selectedIndex!,
      }));
    const res = await fetchWithAuth(`/toeic/exams/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers: mcqAnswers }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    return (await res.json()) as ExamMcqSubmitResult;
  }

  const sectionHint =
    exam?.sectionCounts && Object.keys(exam.sectionCounts).length > 0
      ? formatToeicSectionCounts(exam.sectionCounts)
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
        backHref={`/toeic/${exam.tier}`}
        attemptsBasePath="/toeic/attempts"
        onSubmit={submit}
      />
    </div>
  );
}

export default function ToeicExamPage() {
  return (
    <AuthGate>
      <ExamTakeContent />
    </AuthGate>
  );
}
