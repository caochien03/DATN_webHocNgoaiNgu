"use client";

import { useMemo, useState } from "react";
import { topikQuestionNoMax } from "@/lib/topik-question-limits";
import { topikSectionLabel, topikTierLabel } from "@/lib/topik-labels";
import type { TopikSection, TopikTier } from "@/lib/types";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

export type TopikQuestionFormValues = {
  tier: TopikTier;
  section: TopikSection;
  questionNo: number;
  prompt: string;
  passage: string | null;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  audioUrl: string | null;
  points: number;
  isPublished: boolean;
};

type TopikQuestionFormProps = {
  initial: TopikQuestionFormValues;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: TopikQuestionFormValues) => void | Promise<void>;
  footer?: React.ReactNode;
};

export function TopikQuestionForm({
  initial,
  submitLabel,
  loading = false,
  onSubmit,
  footer,
}: TopikQuestionFormProps) {
  const [tier, setTier] = useState<TopikTier>(initial.tier);
  const [section, setSection] = useState<TopikSection>(initial.section);
  const [questionNo, setQuestionNo] = useState(String(initial.questionNo));
  const [prompt, setPrompt] = useState(initial.prompt);
  const [passage, setPassage] = useState(initial.passage ?? "");
  const [options, setOptions] = useState<string[]>(
    initial.options.length >= 2 ? initial.options : ["", "", "", ""],
  );
  const [correctIndex, setCorrectIndex] = useState(initial.correctIndex);
  const [explanation, setExplanation] = useState(initial.explanation ?? "");
  const [audioUrl, setAudioUrl] = useState(initial.audioUrl ?? "");
  const [points, setPoints] = useState(String(initial.points));
  const [isPublished, setIsPublished] = useState(initial.isPublished);

  const questionNoMax = useMemo(
    () => topikQuestionNoMax(tier, section),
    [tier, section],
  );

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrectIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void onSubmit({
      tier,
      section,
      questionNo: parseInt(questionNo, 10) || 1,
      prompt: prompt.trim(),
      passage: passage.trim() || null,
      options: options.map((o) => o.trim()).filter(Boolean),
      correctIndex,
      explanation: explanation.trim() || null,
      audioUrl:
        section === "LISTENING" && audioUrl.trim() ? audioUrl.trim() : null,
      points: parseInt(points, 10) || 2,
      isPublished,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Cấp độ</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as TopikTier)}
            className={inputClass}
          >
            <option value="TOPIK_I">{topikTierLabel("TOPIK_I")}</option>
            <option value="TOPIK_II">{topikTierLabel("TOPIK_II")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Phần thi</span>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as TopikSection)}
            className={inputClass}
          >
            <option value="LISTENING">{topikSectionLabel("LISTENING")}</option>
            <option value="READING">{topikSectionLabel("READING")}</option>
            <option value="WRITING">{topikSectionLabel("WRITING")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>
            Số câu
            {questionNoMax ? (
              <span className="text-zinc-500"> (1–{questionNoMax})</span>
            ) : null}
          </span>
          <input
            type="number"
            min={1}
            max={questionNoMax ?? undefined}
            required
            value={questionNo}
            onChange={(e) => setQuestionNo(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>Đề bài (prompt)</span>
        <textarea
          required
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Đoạn văn / hội thoại (tùy chọn)</span>
        <textarea
          rows={3}
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          className={inputClass}
        />
      </label>

      {section === "LISTENING" ? (
        <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
          <label className="flex flex-col gap-1 text-sm">
            <span>URL file nghe</span>
            <input
              type="url"
              placeholder="https://..."
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className={inputClass}
            />
          </label>
          {audioUrl.trim() ? (
            <audio className="w-full" controls src={audioUrl.trim()}>
              Trình duyệt không hỗ trợ audio.
            </audio>
          ) : (
            <p className="text-xs text-zinc-500">
              Dán link mp3 để nghe thử. Upload file sẽ bổ sung sau.
            </p>
          )}
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Đáp án</legend>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correctIndex"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              className="shrink-0"
            />
            <input
              required
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Đáp án ${i + 1}`}
              className={`${inputClass} min-w-0 flex-1`}
            />
            {options.length > 2 ? (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="shrink-0 text-xs text-red-600 hover:underline"
              >
                Xóa
              </button>
            ) : null}
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="self-start text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          + Thêm đáp án
        </button>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        <span>Giải thích (tùy chọn)</span>
        <textarea
          rows={2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Điểm</span>
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span>Xuất bản (học viên thấy được)</span>
        </label>
      </div>

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
