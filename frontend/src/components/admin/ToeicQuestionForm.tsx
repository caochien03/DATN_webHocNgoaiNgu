"use client";

import { useState } from "react";
import { formCardClass, inputClass } from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { toeicSectionLabel, toeicTierLabel } from "@/lib/toeic-labels";
import type { ToeicSection, ToeicTier } from "@/lib/types";

export type ToeicQuestionFormValues = {
  tier: ToeicTier;
  section: ToeicSection;
  questionNo: number;
  prompt: string;
  passage: string | null;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  optionImageUrls: string[];
  bundleId: string | null;
  points: number;
  isPublished: boolean;
};

type Props = {
  initial: ToeicQuestionFormValues;
  submitLabel: string;
  loading?: boolean;
  tierLocked?: boolean;
  onSubmit: (values: ToeicQuestionFormValues) => void | Promise<void>;
  footer?: React.ReactNode;
};

function normalizeOptional(value: string) {
  return value.trim() || null;
}

export function ToeicQuestionForm({
  initial,
  submitLabel,
  loading = false,
  tierLocked = false,
  onSubmit,
  footer,
}: Props) {
  const [tier] = useState<ToeicTier>(initial.tier);
  const [section, setSection] = useState(initial.section);
  const [questionNo, setQuestionNo] = useState(String(initial.questionNo));
  const [prompt, setPrompt] = useState(initial.prompt);
  const [passage, setPassage] = useState(initial.passage ?? "");
  const [options, setOptions] = useState(
    initial.options.length >= 2 ? initial.options : ["", "", "", ""],
  );
  const [correctIndex, setCorrectIndex] = useState(String(initial.correctIndex));
  const [explanation, setExplanation] = useState(initial.explanation ?? "");
  const [audioUrl, setAudioUrl] = useState(initial.audioUrl ?? "");
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [optionImageUrls, setOptionImageUrls] = useState(
    initial.optionImageUrls.length > 0
      ? initial.optionImageUrls
      : initial.options.map(() => ""),
  );
  const [bundleId, setBundleId] = useState(initial.bundleId ?? "");
  const [points, setPoints] = useState(String(initial.points));
  const [isPublished, setIsPublished] = useState(initial.isPublished);

  function updateOption(index: number, value: string) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  }

  function addOption() {
    setOptions((current) => [...current, ""]);
    setOptionImageUrls((current) => [...current, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    setOptionImageUrls((current) =>
      current.filter((_, optionIndex) => optionIndex !== index),
    );
    setCorrectIndex((current) => {
      const selected = Number.parseInt(current, 10);
      if (selected === index) return "0";
      return String(selected > index ? selected - 1 : selected);
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void onSubmit({
      tier,
      section,
      questionNo: Number.parseInt(questionNo, 10) || 1,
      prompt: prompt.trim(),
      passage: normalizeOptional(passage),
      options: options.map((option) => option.trim()),
      correctIndex: Number.parseInt(correctIndex, 10) || 0,
      explanation: normalizeOptional(explanation),
      audioUrl: normalizeOptional(audioUrl),
      imageUrl: normalizeOptional(imageUrl),
      optionImageUrls: optionImageUrls.map((url) => url.trim()).filter(Boolean),
      bundleId: normalizeOptional(bundleId),
      points: Number.parseInt(points, 10) || 1,
      isPublished,
    });
  }

  return (
    <form onSubmit={handleSubmit} className={formCardClass}>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Chứng chỉ</span>
          <select value={tier} disabled={tierLocked} className={inputClass}>
            <option value="TOEIC_LR">{toeicTierLabel("TOEIC_LR")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Kỹ năng</span>
          <select
            value={section}
            onChange={(event) => setSection(event.target.value as ToeicSection)}
            className={inputClass}
          >
            <option value="LISTENING">{toeicSectionLabel("LISTENING")}</option>
            <option value="READING">{toeicSectionLabel("READING")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Số câu</span>
          <input
            type="number"
            min={1}
            max={100}
            required
            value={questionNo}
            onChange={(event) => setQuestionNo(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>Đề bài</span>
        <textarea
          required
          rows={3}
          maxLength={4000}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Đoạn văn hoặc hội thoại (tùy chọn)</span>
        <textarea
          rows={4}
          maxLength={8000}
          value={passage}
          onChange={(event) => setPassage(event.target.value)}
          className={inputClass}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <legend className="text-sm font-medium">Đáp án</legend>
          <button
            type="button"
            onClick={addOption}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Thêm đáp án
          </button>
        </div>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct-option"
              checked={Number.parseInt(correctIndex, 10) === index}
              onChange={() => setCorrectIndex(String(index))}
              aria-label={`Chọn đáp án ${index + 1} là đáp án đúng`}
            />
            <input
              required
              maxLength={1000}
              value={option}
              onChange={(event) => updateOption(index, event.target.value)}
              className={`${inputClass} flex-1`}
              placeholder={`Đáp án ${index + 1}`}
            />
            {options.length > 2 ? (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="text-xs text-destructive hover:underline"
              >
                Xóa
              </button>
            ) : null}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Chọn nút tròn bên trái để xác định đáp án đúng.
        </p>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        <span>Giải thích đáp án (tùy chọn)</span>
        <textarea
          rows={3}
          maxLength={4000}
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>URL âm thanh (tùy chọn)</span>
          <input
            type="url"
            value={audioUrl}
            onChange={(event) => setAudioUrl(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>URL hình ảnh (tùy chọn)</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Mã nhóm câu (tùy chọn)</span>
          <input
            maxLength={120}
            value={bundleId}
            onChange={(event) => setBundleId(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Điểm</span>
          <input
            type="number"
            min={1}
            value={points}
            onChange={(event) => setPoints(event.target.value)}
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
        <span>Công bố câu hỏi trong kho luyện tập</span>
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
