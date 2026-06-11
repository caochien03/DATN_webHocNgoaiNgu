"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  TopikExamMetaForm,
  type TopikExamMetaValues,
} from "@/components/admin/TopikExamMetaForm";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { topikSectionLabel, topikTierLabel } from "@/lib/topik-labels";
import type { AdminTopikExamDetail } from "@/lib/types";

function truncate(text: string, max = 72) {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function EditTopikExamContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const replaceFileRef = useRef<HTMLInputElement>(null);

  const [exam, setExam] = useState<AdminTopikExamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [replacing, setReplacing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/admin/topik/exams/${id}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExam((await res.json()) as AdminTopikExamDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được đề");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmitMeta(values: TopikExamMetaValues) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/admin/topik/exams/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          tier: values.tier,
          durationMinutes: values.durationMinutes,
          isPublished: values.isPublished,
          sortOrder: values.sortOrder,
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExam((await res.json()) as AdminTopikExamDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setLoading(false);
    }
  }

  async function removeExam() {
    if (!confirm("Xóa đề này và toàn bộ câu hỏi thuộc đề?")) return;
    const res = await fetchWithAuth(`/admin/topik/exams/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await parseApiError(res));
      return;
    }
    router.push("/admin/topik/exams");
    router.refresh();
  }

  async function replaceFromJson(file: File) {
    setError(null);
    setReplacing(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        questions?: unknown;
        title?: string;
        description?: string | null;
        tier?: string;
        durationMinutes?: number;
        isPublished?: boolean;
        sortOrder?: number;
      };
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        setError("JSON phải có mảng questions không rỗng");
        return;
      }
      const res = await fetchWithAuth(`/admin/topik/exams/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(parsed.title !== undefined && { title: parsed.title }),
          ...(parsed.description !== undefined && {
            description: parsed.description,
          }),
          ...(parsed.tier !== undefined && { tier: parsed.tier }),
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
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExam((await res.json()) as AdminTopikExamDetail);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thay thế được câu từ JSON",
      );
    } finally {
      setReplacing(false);
      if (replaceFileRef.current) replaceFileRef.current.value = "";
    }
  }

  if (!exam && !error) {
    return <p className="px-4 py-8 text-sm text-zinc-500">Đang tải…</p>;
  }

  const metaInitial: TopikExamMetaValues | null = exam
    ? {
        title: exam.title,
        description: exam.description,
        tier: exam.tier,
        durationMinutes: exam.durationMinutes,
        isPublished: exam.isPublished,
        sortOrder: exam.sortOrder,
      }
    : null;

  const slots = exam
    ? [...exam.questions].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/admin/topik/exams"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Danh sách đề
      </Link>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {exam && metaInitial ? (
        <>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Sửa đề TOPIK
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            {topikTierLabel(exam.tier)} · {slots.length} câu
          </p>

          <div className="mt-4">
            <TopikExamMetaForm
              key={exam.updatedAt}
              initial={metaInitial}
              submitLabel="Lưu thông tin đề"
              loading={loading}
              tierLocked={slots.length > 0}
              onSubmit={onSubmitMeta}
              footer={
                <button
                  type="button"
                  onClick={() => void removeExam()}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:text-red-400"
                >
                  Xóa đề
                </button>
              }
            />
          </div>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Câu hỏi ({slots.length})
              </h2>
              <Link
                href={`/admin/topik/exams/${id}/questions/new`}
                className="text-sm text-zinc-700 hover:underline dark:text-zinc-300"
              >
                + Thêm câu
              </Link>
            </div>

            {slots.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Chưa có câu. Thêm câu hoặc import/thay thế bằng JSON bên dưới.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        #{slot.sortOrder + 1} ·{" "}
                        {topikSectionLabel(slot.question.section)} · câu{" "}
                        {slot.question.questionNo}
                        {slot.question.bundleId ? (
                          <span className="ml-2 text-xs font-normal text-sky-700 dark:text-sky-400">
                            bundle: {slot.question.bundleId}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {truncate(slot.question.prompt)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/topik/questions/${slot.questionId}/edit`}
                      className="shrink-0 text-sm text-zinc-700 hover:underline dark:text-zinc-300"
                    >
                      Sửa câu
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Thay toàn bộ câu từ JSON
            </h2>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/90">
              PATCH kèm{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
                questions
              </code>{" "}
              — xóa câu cũ của đề và tạo lại từ file. Metadata trong file (nếu
              có) cũng được cập nhật.
            </p>
            <div className="mt-3">
              <input
                ref={replaceFileRef}
                type="file"
                accept="application/json,.json"
                disabled={replacing}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void replaceFromJson(file);
                }}
                className="text-sm"
              />
              {replacing ? (
                <p className="mt-1 text-sm text-zinc-500">Đang thay thế…</p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default function AdminEditTopikExamPage() {
  return (
    <AdminGate>
      <EditTopikExamContent />
    </AdminGate>
  );
}
