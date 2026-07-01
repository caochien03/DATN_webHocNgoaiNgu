"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError, uploadWithAuth } from "@/lib/api-fetch";
import { Plus } from "lucide-react";
import { GRADIENT } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";

type AdminToeicExamRow = {
  id: string;
  title: string;
  tier: string;
  durationMinutes: number;
  isPublished: boolean;
  sortOrder: number;
  _count: { questions: number };
};

function AdminToeicExamsContent() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [exams, setExams] = useState<AdminToeicExamRow[] | null>(null);
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
      setExams((await res.json()) as AdminToeicExamRow[]);
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
      await load();
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
        sub="Import JSON đề thi LR — công bố để luyện Part và thi thử"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importJson(f);
          }}
        />
        <button
          type="button"
          disabled={importing}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: GRADIENT }}
        >
          <Plus size={14} />
          {importing ? "Đang import…" : "Import JSON"}
        </button>
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
        <ul className="space-y-2">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{exam.title}</p>
                <p className="text-xs text-muted-foreground">
                  {exam._count.questions} câu · {exam.durationMinutes} phút
                  {exam.isPublished ? " · Đã công bố" : " · Nháp"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Mẫu JSON: xem{" "}
        <code className="rounded bg-secondary px-1">
          backend/prisma/templates/toeic-exam-TOEIC_LR.template.json
        </code>
      </p>
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
