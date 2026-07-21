"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  TopikQuestionForm,
  type TopikQuestionFormValues,
} from "@/components/admin/TopikQuestionForm";
import { backLinkClass, dangerButtonClass } from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { topikSectionLabel, topikTierLabel } from "@/lib/topik-labels";
import type { TopikQuestionAdminRow } from "@/lib/types";

function EditTopikQuestionContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [question, setQuestion] = useState<TopikQuestionAdminRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/topik/questions/${id}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setQuestion((await res.json()) as TopikQuestionAdminRow);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được câu hỏi");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(values: TopikQuestionFormValues) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/admin/topik/questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setLoading(false);
    }
  }

  async function removeQuestion() {
    if (!confirm("Xóa câu hỏi này?")) return;
    const res = await fetchWithAuth(`/admin/topik/questions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await parseApiError(res));
      return;
    }
    router.push("/admin/topik/questions");
    router.refresh();
  }

  if (!question && !error) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Đang tải…</p>;
  }

  const formInitial: TopikQuestionFormValues | null = question
    ? {
        tier: question.tier,
        section: question.section,
        questionNo: question.questionNo,
        questionType: question.questionType,
        prompt: question.prompt,
        passage: question.passage,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        audioUrl: question.audioUrl,
        imageUrl: question.imageUrl,
        optionImageUrls: question.optionImageUrls,
        bundleId: question.bundleId,
        modelAnswer: question.modelAnswer,
        writingParts: question.writingParts,
        minChars: question.minChars,
        maxChars: question.maxChars,
        maxScore: question.maxScore,
        rubric: question.rubric,
        points: question.points,
        isPublished: question.isPublished,
      }
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/topik/questions"
        className={backLinkClass}
      >
        ← Danh sách câu hỏi
      </Link>

      {error ? (
        <p className={`mt-4 `}>{error}</p>
      ) : null}

      {question && formInitial ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            Sửa câu hỏi
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {topikTierLabel(question.tier)} ·{" "}
            {topikSectionLabel(question.section)} · câu {question.questionNo}
          </p>

          <div className="mt-4">
            <TopikQuestionForm
              key={question.updatedAt}
              initial={formInitial}
              submitLabel="Lưu câu hỏi"
              loading={loading}
              onSubmit={onSubmit}
              footer={
                <button
                  type="button"
                  onClick={() => void removeQuestion()}
                  className={dangerButtonClass}
                >
                  Xóa câu
                </button>
              }
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function AdminEditTopikQuestionPage() {
  return (
    <AdminGate>
      <EditTopikQuestionContent />
    </AdminGate>
  );
}
