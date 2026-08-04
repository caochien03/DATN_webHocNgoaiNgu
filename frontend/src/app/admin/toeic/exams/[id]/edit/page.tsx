"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  ToeicExamMetaForm,
  type ToeicExamMetaValues,
} from "@/components/admin/ToeicExamMetaForm";
import {
  backLinkClass,
  dangerButtonClass,
  errorBannerClass,
  listItemClass,
  sectionTitleClass,
} from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { toeicSectionLabel, toeicTierLabel } from "@/lib/toeic-labels";
import type { AdminToeicExamDetail } from "@/lib/types";

function truncate(text: string, max = 88) {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function EditToeicExamContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const replaceFileRef = useRef<HTMLInputElement>(null);
  const [exam, setExam] = useState<AdminToeicExamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [replacing, setReplacing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetchWithAuth(`/admin/toeic/exams/${id}`);
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      setExam((await response.json()) as AdminToeicExamDetail);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không tải được đề TOEIC");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveMeta(values: ToeicExamMetaValues) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await fetchWithAuth(`/admin/toeic/exams/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      setExam((await response.json()) as AdminToeicExamDetail);
      setSuccess("Đã cập nhật thông tin đề TOEIC.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không lưu được đề TOEIC");
    } finally {
      setLoading(false);
    }
  }

  async function removeExam() {
    if (!window.confirm("Xóa đề TOEIC này và toàn bộ câu hỏi thuộc đề?")) return;
    setError(null);
    try {
      const response = await fetchWithAuth(`/admin/toeic/exams/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      router.push("/admin/toeic/exams");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không xóa được đề TOEIC");
    }
  }

  async function replaceFromJson(file: File) {
    setError(null);
    setSuccess(null);
    setReplacing(true);
    try {
      const parsed = JSON.parse(await file.text()) as {
        questions?: unknown;
        title?: string;
        description?: string | null;
        durationMinutes?: number;
        isPublished?: boolean;
        sortOrder?: number;
      };
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        setError("Tệp JSON cần có ít nhất một câu hỏi.");
        return;
      }
      const response = await fetchWithAuth(`/admin/toeic/exams/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(parsed.title !== undefined && { title: parsed.title }),
          ...(parsed.description !== undefined && { description: parsed.description }),
          ...(parsed.durationMinutes !== undefined && {
            durationMinutes: parsed.durationMinutes,
          }),
          ...(parsed.isPublished !== undefined && {
            isPublished: parsed.isPublished,
          }),
          ...(parsed.sortOrder !== undefined && { sortOrder: parsed.sortOrder }),
          questions: parsed.questions,
        }),
      });
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      setExam((await response.json()) as AdminToeicExamDetail);
      setSuccess("Đã thay thế danh sách câu hỏi TOEIC từ tệp JSON.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Không đọc hoặc cập nhật được tệp JSON",
      );
    } finally {
      setReplacing(false);
      if (replaceFileRef.current) replaceFileRef.current.value = "";
    }
  }

  if (!exam && !error) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Đang tải…</p>;
  }

  const slots = exam
    ? [...exam.questions].sort((first, second) => first.sortOrder - second.sortOrder)
    : [];
  const meta: ToeicExamMetaValues | null = exam
    ? {
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        isPublished: exam.isPublished,
        sortOrder: exam.sortOrder,
      }
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/admin/toeic/exams" className={backLinkClass}>
        ← Danh sách đề
      </Link>

      {error ? <p className={errorBannerClass}>{error}</p> : null}
      {success ? (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </p>
      ) : null}

      {exam && meta ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-foreground">Sửa đề TOEIC</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {toeicTierLabel(exam.tier)} · {slots.length} câu
          </p>

          <div className="mt-4">
            <ToeicExamMetaForm
              key={exam.updatedAt}
              initial={meta}
              loading={loading}
              onSubmit={saveMeta}
              footer={
                <button
                  type="button"
                  onClick={() => void removeExam()}
                  className={dangerButtonClass}
                >
                  Xóa đề
                </button>
              }
            />
          </div>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={sectionTitleClass}>Câu hỏi ({slots.length})</h2>
              <Link
                href={`/admin/toeic/exams/${id}/questions/new`}
                className="text-sm text-primary hover:underline"
              >
                + Thêm câu
              </Link>
            </div>
            {slots.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Chưa có câu. Thêm câu hoặc import/thay thế bằng JSON bên dưới.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className={`flex flex-wrap items-center justify-between gap-2 ${listItemClass}`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        #{slot.sortOrder + 1} · {toeicSectionLabel(slot.question.section)} · câu{" "}
                        {slot.question.questionNo}
                        {slot.question.bundleId ? (
                          <span className="ml-2 text-xs font-normal text-sky-700 dark:text-sky-400">
                            Nhóm câu: {slot.question.bundleId}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {truncate(slot.question.prompt)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/toeic/questions/${slot.questionId}/edit?examId=${id}`}
                      className="shrink-0 text-sm text-primary hover:underline"
                    >
                      Sửa câu
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Thay câu hỏi bằng tệp JSON
            </h2>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/90">
              Thao tác này thay toàn bộ câu hỏi hiện có. Hãy tải tệp mẫu để giữ đúng cấu trúc dữ liệu.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                ref={replaceFileRef}
                type="file"
                accept="application/json,.json"
                disabled={replacing}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void replaceFromJson(file);
                }}
                className="text-sm"
              />
              <a
                href="/templates/toeic-exam-TOEIC_LR.template.json"
                download
                className="text-sm font-medium text-primary hover:underline"
              >
                Tải mẫu JSON
              </a>
            </div>
            {replacing ? (
              <p className="mt-2 text-sm text-muted-foreground">Đang cập nhật…</p>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default function AdminEditToeicExamPage() {
  return (
    <AdminGate>
      <EditToeicExamContent />
    </AdminGate>
  );
}
