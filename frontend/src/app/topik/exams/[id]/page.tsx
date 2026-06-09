"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopikQuizRunner } from "@/components/topik/TopikQuizRunner";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { TopikExamDetail, TopikSubmitResult } from "@/lib/types";

function ExamTakeContent() {
  const params = useParams();
  const id = params.id as string;
  const [exam, setExam] = useState<TopikExamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/topik/exams/${id}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExam((await res.json()) as TopikExamDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được đề thi");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(
    answers: { questionId: string; selectedIndex: number }[],
  ): Promise<TopikSubmitResult> {
    const res = await fetchWithAuth(`/topik/exams/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    return (await res.json()) as TopikSubmitResult;
  }

  if (error) {
    return <p className="px-4 py-8 text-sm text-red-600">{error}</p>;
  }

  if (!exam) {
    return <p className="px-4 py-8 text-sm text-zinc-500">Đang tải…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <TopikQuizRunner
        title={exam.title}
        subtitle={`${exam.questionCount} câu · ${exam.durationMinutes} phút`}
        questions={exam.questions}
        backHref="/topik"
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
