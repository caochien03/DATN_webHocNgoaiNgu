"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  ToeicQuestionForm,
  type ToeicQuestionFormValues,
} from "@/components/admin/ToeicQuestionForm";
import { backLinkClass, errorBannerClass } from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { AdminToeicExamDetail } from "@/lib/types";

function AddToeicExamQuestionContent() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const [exam, setExam] = useState<AdminToeicExamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetchWithAuth(`/admin/toeic/exams/${examId}`);
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      setExam((await response.json()) as AdminToeicExamDetail);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không tải được đề TOEIC");
    }
  }, [examId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addQuestion(values: ToeicQuestionFormValues) {
    if (!exam) return;
    setError(null);
    setLoading(true);
    try {
      const createResponse = await fetchWithAuth("/admin/toeic/questions", {
        method: "POST",
        body: JSON.stringify(values),
      });
      if (!createResponse.ok) {
        setError(await parseApiError(createResponse));
        return;
      }
      const created = (await createResponse.json()) as { id: string };
      const linkResponse = await fetchWithAuth(
        `/admin/toeic/exams/${examId}/questions`,
        {
          method: "POST",
          body: JSON.stringify({
            questionId: created.id,
            sortOrder: exam.questions.length,
          }),
        },
      );
      if (!linkResponse.ok) {
        setError(await parseApiError(linkResponse));
        return;
      }
      router.push(`/admin/toeic/exams/${examId}/edit`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thêm được câu hỏi");
    } finally {
      setLoading(false);
    }
  }

  const initial: ToeicQuestionFormValues = {
    tier: "TOEIC_LR",
    section: "LISTENING",
    questionNo: Math.min((exam?.questions.length ?? 0) + 1, 100),
    prompt: "",
    passage: null,
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: null,
    audioUrl: null,
    imageUrl: null,
    optionImageUrls: [],
    bundleId: null,
    points: 1,
    isPublished: true,
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href={`/admin/toeic/exams/${examId}/edit`} className={backLinkClass}>
        ← Sửa đề
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Thêm câu vào đề
      </h1>
      {exam ? <p className="mt-1 text-sm text-muted-foreground">{exam.title}</p> : null}
      {error ? <p className={errorBannerClass}>{error}</p> : null}
      {exam ? (
        <div className="mt-4">
          <ToeicQuestionForm
            initial={initial}
            submitLabel="Thêm câu vào đề"
            loading={loading}
            tierLocked
            onSubmit={addQuestion}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function AdminAddToeicExamQuestionPage() {
  return (
    <AdminGate>
      <AddToeicExamQuestionContent />
    </AdminGate>
  );
}
