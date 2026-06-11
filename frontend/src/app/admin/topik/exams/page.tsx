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
import { topikTierLabel } from "@/lib/topik-labels";
import type { AdminTopikExamDetail, AdminTopikExamListRow, TopikTier } from "@/lib/types";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

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
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Quản trị đề TOPIK
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tạo đề thi thử cố định, import JSON, công bố để luyện dạng.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/topik/exams/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            + Tạo đề mới
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Lọc cấp độ</span>
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
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Sửa từng câu hỏi →
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Import đề từ JSON
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          File gồm metadata đề và mảng{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            questions
          </code>
          . Xem mẫu trong{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
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
            className="text-sm"
          />
          {importing ? (
            <span className="text-sm text-zinc-500">Đang import…</span>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {filtered === null ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Chưa có đề thi.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {filtered.map((exam) => (
            <li
              key={exam.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {exam.title}
                  {!exam.isPublished ? (
                    <span className="ml-2 text-xs font-normal text-amber-700 dark:text-amber-400">
                      Nháp
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-zinc-500">
                  {topikTierLabel(exam.tier)} · {exam._count.questions} câu ·{" "}
                  {exam.durationMinutes} phút
                </p>
              </div>
              <Link
                href={`/admin/topik/exams/${exam.id}/edit`}
                className="shrink-0 text-sm text-zinc-700 hover:underline dark:text-zinc-300"
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
