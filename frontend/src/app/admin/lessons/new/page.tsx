"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { AdminLanguageSelect } from "@/components/admin/AdminLanguageControls";
import {
  backLinkClass,
  errorClass,
  inputClass,
  labelClass,
  labelTextClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { GRAMMAR_LEVELS } from "@/lib/grammar-levels";
import type { GrammarLevel } from "@/lib/types";

function NewLessonForm() {
  const router = useRouter();
  const [level, setLevel] = useState<GrammarLevel>("BEGINNER_1");
  const [languageCode, setLanguageCode] = useState("ko");
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
          languageCode,
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
      <Link href="/admin/lessons" className={backLinkClass}>
        ← Danh sách admin
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Tạo bài học mới
      </h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <AdminLanguageSelect value={languageCode} onChange={setLanguageCode} />
        <label className={labelClass}>
          <span className={labelTextClass}>Cấp độ *</span>
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
          <span className={labelTextClass}>Tóm tắt</span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
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
          {loading ? "Đang tạo…" : "Tạo và chỉnh sửa nội dung"}
        </GradientButton>
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
