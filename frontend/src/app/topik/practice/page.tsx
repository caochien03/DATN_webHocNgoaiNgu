"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopikQuizRunner } from "@/components/topik/TopikQuizRunner";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { topikSectionLabel } from "@/lib/topik-labels";
import type {
  TopikQuestion,
  TopikSection,
  TopikSubmitResult,
  TopikTier,
} from "@/lib/types";

function PracticeContent() {
  const params = useSearchParams();
  const tier = (params.get("tier") ?? "TOPIK_I") as TopikTier;
  const section = params.get("section") as TopikSection | null;
  const fromNo = params.get("fromNo");
  const toNo = params.get("toNo");

  const [questions, setQuestions] = useState<TopikQuestion[] | null>(null);
  const [formatTitle, setFormatTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!section || !fromNo || !toNo) {
      setError("Thiếu tham số dạng bài.");
      return;
    }
    setError(null);
    try {
      const q = new URLSearchParams({
        tier,
        section,
        fromNo,
        toNo,
        limit: "10",
      });
      const res = await fetchWithAuth(`/topik/practice?${q}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const data = (await res.json()) as {
        questions: TopikQuestion[];
        fromNo: number;
        toNo: number;
      };
      setQuestions(data.questions);

      const fmtRes = await fetchWithAuth(
        `/topik/formats?tier=${tier}&section=${section}`,
      );
      if (fmtRes.ok) {
        const formats = (await fmtRes.json()) as {
          fromNo: number;
          toNo: number;
          title: string;
        }[];
        const match = formats.find(
          (f) => f.fromNo === data.fromNo && f.toNo === data.toNo,
        );
        if (match) setFormatTitle(match.title);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được câu hỏi");
    }
  }, [tier, section, fromNo, toNo]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(
    answers: { questionId: string; selectedIndex: number }[],
  ): Promise<TopikSubmitResult> {
    const res = await fetchWithAuth("/topik/practice/submit", {
      method: "POST",
      body: JSON.stringify({
        tier,
        section,
        fromNo: parseInt(fromNo!, 10),
        toNo: parseInt(toNo!, 10),
        answers,
      }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    return (await res.json()) as TopikSubmitResult;
  }

  if (error) {
    return <p className="px-4 py-8 text-sm text-red-600">{error}</p>;
  }

  if (!questions) {
    return <p className="px-4 py-8 text-sm text-zinc-500">Đang tải…</p>;
  }

  const subtitle =
    section && fromNo && toNo
      ? `${topikSectionLabel(section)} · câu ${fromNo}${toNo !== fromNo ? `–${toNo}` : ""}${formatTitle ? ` · ${formatTitle}` : ""}`
      : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <TopikQuizRunner
        title="Luyện dạng bài"
        subtitle={subtitle}
        questions={questions}
        backHref="/topik"
        onSubmit={submit}
      />
    </div>
  );
}

export default function TopikPracticePage() {
  return (
    <AuthGate>
      <PracticeContent />
    </AuthGate>
  );
}
