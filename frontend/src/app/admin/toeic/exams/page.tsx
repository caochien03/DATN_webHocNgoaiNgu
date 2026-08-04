"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError, uploadWithAuth } from "@/lib/api-fetch";
import { Plus } from "lucide-react";
import { GRADIENT } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
import type {
  AdminToeicExamDetail,
  AdminToeicExamListRow,
} from "@/lib/types";

function AdminToeicExamsContent() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exams, setExams] = useState<AdminToeicExamListRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/admin/toeic/exams");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExams((await res.json()) as AdminToeicExamListRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function importJson(file: File) {
    setError(null);
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await uploadWithAuth("/admin/toeic/exams/import", form);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const created = (await res.json()) as AdminToeicExamDetail;
      router.push(`/admin/toeic/exams/${created.id}/edit`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import thất bại");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Quản trị đề TOEIC"
        sub="Tạo đề thi thử cố định, import JSON, công bố để luyện Part"
        action={
          <Link
            href="/admin/toeic/exams/new"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} /> Tạo đề mới
          </Link>
        }
      />

      <div className="mb-4">
        <Link
          href="/admin/toeic/questions"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sửa từng câu hỏi →
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-dashed border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Import đề từ JSON</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Tệp JSON gồm thông tin đề và mảng{" "}
          <code className="rounded bg-secondary px-1">questions</code>. Tải tệp
          mẫu, điền nội dung rồi tải lên.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            disabled={importing}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importJson(file);
            }}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
          {importing ? (
            <span className="text-sm text-muted-foreground">Đang import…</span>
          ) : null}
          <a
            href="/templates/toeic-exam-TOEIC_LR.template.json"
            download
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Tải mẫu TOEIC LR
          </a>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {exams === null ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : exams.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có đề TOEIC.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {exam.title}
                  {!exam.isPublished ? (
                    <span className="ml-2 text-xs font-normal text-amber-300">
                      Nháp
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {exam._count.questions} câu · {exam.durationMinutes} phút
                </p>
              </div>
              <Link
                href={`/admin/toeic/exams/${exam.id}/edit`}
                className="shrink-0 text-sm font-medium text-primary hover:underline"
              >
                Sửa
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminToeicExamsPage() {
  return (
    <AdminGate>
      <AdminToeicExamsContent />
    </AdminGate>
  );
}
