"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

function NewPathForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [languageCode, setLanguageCode] = useState("ko");
  const [level, setLevel] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetchWithAuth("/admin/paths", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          ...(description.trim() && { description: description.trim() }),
          languageCode: languageCode.trim() || "ko",
          ...(level.trim() && { level: level.trim() }),
          sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const path = (await res.json()) as { id: string };
      router.push(`/admin/paths/${path.id}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được lộ trình");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href="/admin/paths"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Danh sách lộ trình
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Tạo lộ trình mới
      </h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>Tiêu đề *</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Mô tả</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Mã ngôn ngữ</span>
          <input
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Cấp độ</span>
          <input
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="VD: TOPIK 1"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Thứ tự</span>
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
          className="rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Đang tạo…" : "Tạo và thêm bước"}
        </button>
      </form>
    </div>
  );
}

export default function AdminNewPathPage() {
  return (
    <AdminGate>
      <NewPathForm />
    </AdminGate>
  );
}
