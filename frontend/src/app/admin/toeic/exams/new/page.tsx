"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  emptyToeicExamQuestion,
  normalizeToeicExamQuestions,
  ToeicExamQuestionInputFields,
} from "@/components/admin/ToeicExamQuestionInputFields";
import {
  backLinkClass,
  errorBannerClass,
  formCardClass,
  inputClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { AdminToeicExamDetail, ToeicExamQuestionInput } from "@/lib/types";

function NewToeicExamContent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("120");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<ToeicExamQuestionInput[]>([
    emptyToeicExamQuestion(0),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateQuestion(index: number, value: ToeicExamQuestionInput) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? value : question,
      ),
    );
  }

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      emptyToeicExamQuestion(current.length),
    ]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions((current) =>
      current.filter((_, questionIndex) => questionIndex !== index),
    );
  }

  async function createExam(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeToeicExamQuestions(questions);
    if (normalized.some((question) => !question.prompt)) {
      setError("Mỗi câu hỏi cần có đề bài.");
      return;
    }
    if (normalized.some((question) => question.options.some((option) => !option))) {
      setError("Các đáp án không được để trống.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await fetchWithAuth("/admin/toeic/exams", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          tier: "TOEIC_LR",
          durationMinutes: Number.parseInt(durationMinutes, 10) || 120,
          sortOrder: Number.parseInt(sortOrder, 10) || 0,
          isPublished,
          questions: normalized,
        }),
      });
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      const created = (await response.json()) as AdminToeicExamDetail;
      router.push(`/admin/toeic/exams/${created.id}/edit`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không tạo được đề TOEIC");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/admin/toeic/exams" className={backLinkClass}>
        ← Danh sách đề
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Tạo đề TOEIC mới
      </h1>

      {error ? <p className={errorBannerClass}>{error}</p> : null}

      <form onSubmit={(event) => void createExam(event)} className="mt-4">
      <section className={formCardClass}>
        <label className="flex flex-col gap-1 text-sm">
          <span>Tên đề</span>
          <input
            required
            maxLength={300}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Mô tả (tùy chọn)</span>
          <textarea
            rows={2}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClass}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Thời gian (phút)</span>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Thứ tự hiển thị</span>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
          />
          <span>Công bố sau khi tạo đề</span>
        </label>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">
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
        <div className="flex flex-col gap-3">
          {questions.map((question, index) => (
            <ToeicExamQuestionInputFields
              key={index}
              index={index}
              value={question}
              defaultOpen={index === questions.length - 1}
              onChange={(value) => updateQuestion(index, value)}
              onRemove={
                questions.length > 1 ? () => removeQuestion(index) : undefined
              }
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Có thể bổ sung hoặc chỉnh sửa từng câu sau khi tạo đề.
        </p>
        <GradientButton type="submit" disabled={loading} className="mt-4">
          {loading ? "Đang tạo…" : "Tạo đề"}
        </GradientButton>
      </section>
      </form>
    </div>
  );
}

export default function AdminNewToeicExamPage() {
  return (
    <AdminGate>
      <NewToeicExamContent />
    </AdminGate>
  );
}
