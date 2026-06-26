"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGate } from "@/components/AdminGate";
import {
  fetchWithAuth,
  parseApiError,
  uploadWithAuth,
} from "@/lib/api-fetch";
import { Plus } from "lucide-react";
import { GRADIENT } from "@/components/ui-kit/brand";
import { inputClass } from "@/components/ui-kit/form-styles";
import { PageHeader } from "@/components/ui-kit/primitives";
import { topikTierLabel } from "@/lib/topik-labels";
import type { AdminTopikExamDetail, AdminTopikExamListRow, TopikTier } from "@/lib/types";

function AdminTopikExamsContent() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tier, setTier] = useState<TopikTier | "">("");
  const [exams, setExams] = useState<AdminTopikExamListRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/admin/topik/exams");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setExams((await res.json()) as AdminTopikExamListRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered =
    exams?.filter((e) => !tier || e.tier === tier) ?? null;

  async function importJson(file: File) {
    setError(null);
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await uploadWithAuth("/admin/topik/exams/import", form);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const created = (await res.json()) as AdminTopikExamDetail;
      router.push(`/admin/topik/exams/${created.id}/edit`);
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
        title="Quản trị đề TOPIK"
        sub="Tạo đề thi thử cố định, import JSON, công bố để luyện dạng"
        action={
          <Link
            href="/admin/topik/exams/new"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} /> Tạo đề mới
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Lọc cấp độ</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as TopikTier | "")}
            className={inputClass}
          >
            <option value="">Tất cả</option>
            <option value="TOPIK_I">{topikTierLabel("TOPIK_I")}</option>
            <option value="TOPIK_II">{topikTierLabel("TOPIK_II")}</option>
          </select>
        </label>
        <Link
          href="/admin/topik/questions"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sửa từng câu hỏi →
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-dashed border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Import đề từ JSON</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          File gồm metadata đề và mảng{" "}
          <code className="rounded bg-secondary px-1">questions</code>. Xem mẫu
          trong{" "}
          <code className="rounded bg-secondary px-1">
            backend/prisma/templates/topik-exam-TOPIK_I.template.json
          </code>
          .
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            disabled={importing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importJson(file);
            }}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
          {importing ? (
            <span className="text-sm text-muted-foreground">Đang import…</span>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {filtered === null ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có đề thi.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((exam) => (
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
                  {topikTierLabel(exam.tier)} · {exam._count.questions} câu ·{" "}
                  {exam.durationMinutes} phút
                </p>
              </div>
              <Link
                href={`/admin/topik/exams/${exam.id}/edit`}
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

export default function AdminTopikExamsPage() {
  return (
    <AdminGate>
      <AdminTopikExamsContent />
    </AdminGate>
  );
}
