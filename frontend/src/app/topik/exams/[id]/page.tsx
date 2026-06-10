"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopikQuizRunner } from "@/components/topik/TopikQuizRunner";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { TopikExamStartResult, TopikSubmitResult } from "@/lib/types";

function ExamTakeContent() {
  const params = useParams();
  const id = params.id as string;
  const [session, setSession] = useState<TopikExamStartResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/topik/exams/${id}/start`, {
        method: "POST",
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setSession((await res.json()) as TopikExamStartResult);
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
    if (!session) throw new Error("Chưa có phiên thi");
    const res = await fetchWithAuth(`/topik/exams/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ attemptId: session.attemptId, answers }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    return (await res.json()) as TopikSubmitResult;
  }

  if (error) {
    return <p className="px-4 py-8 text-sm text-red-600">{error}</p>;
  }

  if (!session) {
    return <p className="px-4 py-8 text-sm text-zinc-500">Đang tải đề thi…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {session.resumed ? (
        <p className="mb-4 text-sm text-amber-800 dark:text-amber-300">
          Tiếp tục phiên thi đang làm dở.
        </p>
      ) : null}
      <TopikQuizRunner
        title={session.title}
        subtitle={`${session.questionCount} câu · ${session.durationMinutes} phút`}
        questions={session.questions}
        backHref={`/topik/${session.tier}`}
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
