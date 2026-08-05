"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  emptyExamQuestion,
  ExamQuestionInputFields,
  normalizeExamQuestions,
} from "@/components/admin/ExamQuestionInputFields";
import {
  TopikExamMetaForm,
  type TopikExamMetaValues,
} from "@/components/admin/TopikExamMetaForm";
import {
  backLinkClass,
  errorBannerClass,
  sectionTitleClass,
} from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { AdminTopikExamDetail, ExamQuestionInput } from "@/lib/types";

const defaultMeta: TopikExamMetaValues = {
  title: "",
  description: null,
  tier: "TOPIK_I",
  durationMinutes: 100,
  isPublished: false,
  sortOrder: 0,
};

function NewTopikExamContent() {
  const router = useRouter();
  const [meta, setMeta] = useState<TopikExamMetaValues>(defaultMeta);
  const [questions, setQuestions] = useState<ExamQuestionInput[]>([
    emptyExamQuestion(0),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateQuestion(index: number, value: ExamQuestionInput) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyExamQuestion(prev.length)]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmitMeta(values: TopikExamMetaValues) {
    setMeta(values);
    setError(null);

    const normalized = normalizeExamQuestions(questions);
    if (normalized.length === 0) {
      setError("Cần ít nhất một câu hỏi");
      return;
    }
    for (const q of normalized) {
      if (!q.prompt) {
        setError("Mỗi câu cần đề bài");
        return;
      }
      const isMcq = (q.questionType ?? "MULTIPLE_CHOICE") === "MULTIPLE_CHOICE";
      if (isMcq && (q.options?.length ?? 0) < 2) {
        setError("Câu trắc nghiệm cần ít nhất 2 đáp án");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth("/admin/topik/exams", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          description: values.description ?? undefined,
          questions: normalized,
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const created = (await res.json()) as AdminTopikExamDetail;
      router.push(`/admin/topik/exams/${created.id}/edit`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tạo được đề");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/topik/exams"
        className={backLinkClass}
      >
        ← Danh sách đề
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Tạo đề TOPIK mới
      </h1>

      {error ? (
        <p className={errorBannerClass}>{error}</p>
      ) : null}

      <div className="mt-4">
        <TopikExamMetaForm
          initial={meta}
          submitLabel="Tạo đề"
          loading={loading}
          onSubmit={onSubmitMeta}
        />
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={sectionTitleClass}>
            Câu hỏi trong đề ({questions.length})
          </h2>
          <button
            type="button"
            onClick={addQuestion}
            className="text-sm text-primary hover:underline"
          >
            + Thêm câu
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {questions.map((q, i) => (
            <ExamQuestionInputFields
              key={i}
              tier={meta.tier}
              index={i}
              value={q}
              defaultOpen={i === questions.length - 1}
              onChange={(v) => updateQuestion(i, v)}
              onRemove={
                questions.length > 1 ? () => removeQuestion(i) : undefined
              }
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Nhấn &quot;Tạo đề&quot; ở trên để lưu metadata và toàn bộ câu hỏi.
        </p>
      </section>
    </div>
  );
}

export default function AdminNewTopikExamPage() {
  return (
    <AdminGate>
      <NewTopikExamContent />
    </AdminGate>
  );
}
