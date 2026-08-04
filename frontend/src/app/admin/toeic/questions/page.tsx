"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { GRADIENT } from "@/components/ui-kit/brand";
import { inputClass } from "@/components/ui-kit/form-styles";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { toeicSectionLabel } from "@/lib/toeic-labels";
import type { ToeicQuestionAdminRow, ToeicSection } from "@/lib/types";

function AdminToeicQuestionsContent() {
  const [section, setSection] = useState<ToeicSection | "">("");
  const [questions, setQuestions] = useState<ToeicQuestionAdminRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const query = section ? `?section=${section}` : "";
      const response = await fetchWithAuth(`/admin/toeic/questions${query}`);
      if (!response.ok) {
        setError(await parseApiError(response));
        return;
      }
      setQuestions((await response.json()) as ToeicQuestionAdminRow[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không tải được câu hỏi");
    }
  }, [section]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Quản trị câu hỏi TOEIC"
        sub="Tạo và chỉnh sửa từng câu hỏi trong kho luyện tập"
        action={
          <Link
            href="/admin/toeic/questions/new"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} /> Tạo câu hỏi
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Lọc kỹ năng</span>
          <select
            value={section}
            onChange={(event) => setSection(event.target.value as ToeicSection | "")}
            className={inputClass}
          >
            <option value="">Tất cả</option>
            <option value="LISTENING">{toeicSectionLabel("LISTENING")}</option>
            <option value="READING">{toeicSectionLabel("READING")}</option>
          </select>
        </label>
        <Link href="/admin/toeic/exams" className="text-sm text-primary hover:underline">
          Quản trị đề thi →
        </Link>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {questions === null ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có câu hỏi.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {questions.map((question) => (
            <li
              key={question.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {toeicSectionLabel(question.section)} · câu {question.questionNo}
                  {!question.isPublished ? (
                    <span className="ml-2 text-xs font-normal text-amber-300">Nháp</span>
                  ) : null}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {question.prompt}
                </p>
              </div>
              <Link
                href={`/admin/toeic/questions/${question.id}/edit`}
                className="shrink-0 text-sm font-medium text-primary hover:underline"
              >
                Sửa câu
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminToeicQuestionsPage() {
  return (
    <AdminGate>
      <AdminToeicQuestionsContent />
    </AdminGate>
  );
}
