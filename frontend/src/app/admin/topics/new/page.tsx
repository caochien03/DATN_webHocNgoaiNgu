"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import {
  backLinkClass,
  errorClass,
  inputClass,
  labelClass,
  labelTextClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";

function NewTopicForm() {
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
      const res = await fetchWithAuth("/admin/topics", {
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
      const topic = (await res.json()) as { id: string };
      router.push(`/admin/topics/${topic.id}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được chủ đề");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href="/admin/topics" className={backLinkClass}>
        ← Danh sách chủ đề
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Tạo chủ đề mới
      </h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className={labelClass}>
          <span className={labelTextClass}>Tiêu đề *</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Mô tả</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Mã ngôn ngữ</span>
          <input
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            placeholder="ko"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Cấp độ</span>
          <input
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="VD: TOPIK 1"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Thứ tự</span>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={inputClass}
          />
        </label>
        {error ? <p className={errorClass}>{error}</p> : null}
        <GradientButton type="submit" disabled={loading} className="w-full py-2.5">
          {loading ? "Đang tạo…" : "Tạo và thêm từ"}
        </GradientButton>
      </form>
    </div>
  );
}

export default function AdminNewTopicPage() {
  return (
    <AdminGate>
      <NewTopicForm />
    </AdminGate>
  );
}
