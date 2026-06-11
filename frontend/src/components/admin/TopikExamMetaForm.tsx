"use client";

import { useState } from "react";
import { topikTierLabel } from "@/lib/topik-labels";
import type { TopikTier } from "@/lib/types";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

export type TopikExamMetaValues = {
  title: string;
  description: string | null;
  tier: TopikTier;
  durationMinutes: number;
  isPublished: boolean;
  sortOrder: number;
};

type TopikExamMetaFormProps = {
  initial: TopikExamMetaValues;
  submitLabel: string;
  loading?: boolean;
  tierLocked?: boolean;
  onSubmit: (values: TopikExamMetaValues) => void | Promise<void>;
  footer?: React.ReactNode;
};

export function TopikExamMetaForm({
  initial,
  submitLabel,
  loading = false,
  tierLocked = false,
  onSubmit,
  footer,
}: TopikExamMetaFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [tier, setTier] = useState<TopikTier>(initial.tier);
  const [durationMinutes, setDurationMinutes] = useState(
    String(initial.durationMinutes),
  );
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [sortOrder, setSortOrder] = useState(String(initial.sortOrder));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      tier,
      durationMinutes: parseInt(durationMinutes, 10) || 100,
      isPublished,
      sortOrder: parseInt(sortOrder, 10) || 0,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span>Tên đề</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Mô tả (tùy chọn)</span>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Cấp độ</span>
          <select
            value={tier}
            disabled={tierLocked}
            onChange={(e) => setTier(e.target.value as TopikTier)}
            className={inputClass}
          >
            <option value="TOPIK_I">{topikTierLabel("TOPIK_I")}</option>
            <option value="TOPIK_II">{topikTierLabel("TOPIK_II")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Thời gian (phút)</span>
          <input
            type="number"
            min={1}
            required
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Thứ tự hiển thị</span>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        <span>Công bố (học viên thấy đề + câu vào pool luyện dạng)</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Đang lưu…" : submitLabel}
        </button>
        {footer}
      </div>
    </form>
  );
}
