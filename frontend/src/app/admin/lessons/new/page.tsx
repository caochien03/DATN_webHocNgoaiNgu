"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { GRAMMAR_LEVELS } from "@/lib/grammar-levels";
import type { GrammarLevel } from "@/lib/types";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

function NewLessonForm() {
  const router = useRouter();
  const [level, setLevel] = useState<GrammarLevel>("BEGINNER_1");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithAuth("/admin/lessons", {
        method: "POST",
        body: JSON.stringify({
          level,
          title: title.trim(),
          ...(summary.trim() && { summary: summary.trim() }),
          sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const lesson = (await res.json()) as { id: string };
      router.push(`/admin/lessons/${lesson.id}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được bài");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href="/admin/lessons"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Danh sách admin
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Tạo bài học mới
      </h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Cấp độ *</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as GrammarLevel)}
            className={inputClass}
          >
            {GRAMMAR_LEVELS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Tiêu đề *</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Tóm tắt</span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Thứ tự</span>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={inputClass}
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "Đang tạo…" : "Tạo và chỉnh sửa nội dung"}
        </button>
      </form>
    </div>
  );
}

export default function AdminNewLessonPage() {
  return (
    <AdminGate>
      <NewLessonForm />
    </AdminGate>
  );
}
