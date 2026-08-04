"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  ToeicQuestionForm,
  type ToeicQuestionFormValues,
} from "@/components/admin/ToeicQuestionForm";
import {
  backLinkClass,
  dangerButtonClass,
  errorBannerClass,
} from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { toeicSectionLabel, toeicTierLabel } from "@/lib/toeic-labels";
import type { ToeicQuestionAdminRow } from "@/lib/types";

function EditToeicQuestionContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const examId = searchParams.get("examId");
  const backHref = examId
    ? `/admin/toeic/exams/${examId}/edit`
    : "/admin/toeic/questions";
  const [question, setQuestion] = useState<ToeicQuestionAdminRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetchWithAuth(`/admin/toeic/questions/${id}`);
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      setQuestion((await response.json()) as ToeicQuestionAdminRow);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không tải được câu hỏi");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(values: ToeicQuestionFormValues) {
    setError(null);
    setLoading(true);
    try {
      const response = await fetchWithAuth(`/admin/toeic/questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      setQuestion((await response.json()) as ToeicQuestionAdminRow);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không lưu được câu hỏi");
    } finally {
      setLoading(false);
    }
  }

  async function removeQuestion() {
    if (!window.confirm("Xóa câu hỏi này?")) return;
    const response = await fetchWithAuth(`/admin/toeic/questions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError(await parseApiError(response));
      return;
    }
    router.push(backHref);
    router.refresh();
  }

  const initial: ToeicQuestionFormValues | null = question
    ? {
        tier: question.tier,
        section: question.section,
        questionNo: question.questionNo,
        prompt: question.prompt,
        passage: question.passage,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        audioUrl: question.audioUrl,
        imageUrl: question.imageUrl,
        optionImageUrls: question.optionImageUrls,
        bundleId: question.bundleId ?? null,
        points: question.points,
        isPublished: question.isPublished,
      }
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href={backHref} className={backLinkClass}>
        ← {examId ? "Sửa đề" : "Danh sách câu hỏi"}
      </Link>
      {error ? <p className={errorBannerClass}>{error}</p> : null}
      {question && initial ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-foreground">Sửa câu hỏi</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {toeicTierLabel(question.tier)} · {toeicSectionLabel(question.section)} · câu{" "}
            {question.questionNo}
          </p>
          <div className="mt-4">
            <ToeicQuestionForm
              key={question.updatedAt}
              initial={initial}
              submitLabel="Lưu câu hỏi"
              loading={loading}
              tierLocked
              onSubmit={save}
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

export default function AdminEditToeicQuestionPage() {
  return (
    <AdminGate>
      <EditToeicQuestionContent />
    </AdminGate>
  );
}
