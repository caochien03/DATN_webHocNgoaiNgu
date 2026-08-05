"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  emptyExamQuestion,
  ExamQuestionInputFields,
  normalizeExamQuestions,
} from "@/components/admin/ExamQuestionInputFields";
import { backLinkClass, errorBannerClass } from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { AdminTopikExamDetail, ExamQuestionInput } from "@/lib/types";

function AddExamQuestionContent() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<AdminTopikExamDetail | null>(null);
  const [question, setQuestion] = useState<ExamQuestionInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/topik/exams/${examId}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const data = (await res.json()) as AdminTopikExamDetail;
      setExam(data);
      setQuestion(emptyExamQuestion(data.questions.length));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được đề");
    }
  }, [examId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exam || !question) return;

    const normalized = normalizeExamQuestions([question])[0];
    if (!normalized?.prompt) {
      setError("Cần đề bài");
      return;
    }
    if (
      (normalized.questionType ?? "MULTIPLE_CHOICE") === "MULTIPLE_CHOICE" &&
      (normalized.options?.length ?? 0) < 2
    ) {
      setError("Câu trắc nghiệm cần ít nhất 2 đáp án");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const createRes = await fetchWithAuth("/admin/topik/questions", {
        method: "POST",
        body: JSON.stringify({
          tier: exam.tier,
          section: normalized.section,
          questionNo: normalized.questionNo,
          questionType: normalized.questionType,
          prompt: normalized.prompt,
          passage: normalized.passage ?? null,
          options: normalized.options ?? [],
          correctIndex: normalized.correctIndex ?? 0,
          explanation: normalized.explanation ?? null,
          audioUrl: normalized.audioUrl ?? null,
          imageUrl: normalized.imageUrl ?? null,
          optionImageUrls: normalized.optionImageUrls ?? [],
          bundleId: normalized.bundleId ?? null,
          modelAnswer: normalized.modelAnswer ?? null,
          writingParts: normalized.writingParts ?? null,
          minChars: normalized.minChars ?? null,
          maxChars: normalized.maxChars ?? null,
          maxScore: normalized.maxScore ?? null,
          rubric: normalized.rubric ?? null,
          points: normalized.points ?? 2,
          isPublished: true,
        }),
      });
      if (!createRes.ok) {
        setError(await parseApiError(createRes));
        return;
      }
      const created = (await createRes.json()) as { id: string };

      const linkRes = await fetchWithAuth(
        `/admin/topik/exams/${examId}/questions`,
        {
          method: "POST",
          body: JSON.stringify({
            questionId: created.id,
            sortOrder: normalized.sortOrder,
          }),
        },
      );
      if (!linkRes.ok) {
        setError(await parseApiError(linkRes));
        return;
      }

      router.push(`/admin/topik/exams/${examId}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thêm được câu");
    } finally {
      setLoading(false);
    }
  }

  if (!exam && !error) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href={`/admin/topik/exams/${examId}/edit`}
        className={backLinkClass}
      >
        ← Sửa đề
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Thêm câu vào đề
      </h1>
      {exam ? (
        <p className="mt-1 text-sm text-muted-foreground">{exam.title}</p>
      ) : null}

      {error ? (
        <p className={errorBannerClass}>{error}</p>
      ) : null}

      {exam && question ? (
        <form onSubmit={(e) => void onSubmit(e)} className="mt-4">
          <ExamQuestionInputFields
            tier={exam.tier}
            index={exam.questions.length}
            value={question}
            defaultOpen
            onChange={setQuestion}
          />
          <GradientButton type="submit" disabled={loading} className="mt-4">
            {loading ? "Đang lưu…" : "Thêm câu vào đề"}
          </GradientButton>
        </form>
      ) : null}
    </div>
  );
}

export default function AdminAddExamQuestionPage() {
  return (
    <AdminGate>
      <AddExamQuestionContent />
    </AdminGate>
  );
}
