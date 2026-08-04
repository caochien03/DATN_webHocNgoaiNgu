"use client";

import { useState } from "react";
import { formCardClass, inputClass } from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";

export type ToeicExamMetaValues = {
  title: string;
  description: string | null;
  durationMinutes: number;
  isPublished: boolean;
  sortOrder: number;
};

type ToeicExamMetaFormProps = {
  initial: ToeicExamMetaValues;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (values: ToeicExamMetaValues) => void | Promise<void>;
  footer?: React.ReactNode;
};

export function ToeicExamMetaForm({
  initial,
  submitLabel = "Lưu thông tin đề",
  loading = false,
  onSubmit,
  footer,
}: ToeicExamMetaFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    String(initial.durationMinutes),
  );
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [sortOrder, setSortOrder] = useState(String(initial.sortOrder));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      durationMinutes: Number.parseInt(durationMinutes, 10) || 120,
      isPublished,
      sortOrder: Number.parseInt(sortOrder, 10) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className={formCardClass}>
      <label className="flex flex-col gap-1 text-sm">
        <span>Tên đề</span>
        <input
          required
          maxLength={300}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Mô tả (tùy chọn)</span>
        <textarea
          rows={2}
          maxLength={2000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Thời gian (phút)</span>
          <input
            type="number"
            min={1}
            required
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Thứ tự hiển thị</span>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(event) => setIsPublished(event.target.checked)}
        />
        <span>Công bố để học viên có thể luyện tập và thi thử</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <GradientButton type="submit" disabled={loading}>
          {loading ? "Đang lưu…" : submitLabel}
        </GradientButton>
        {footer}
      </div>
    </form>
  );
}
