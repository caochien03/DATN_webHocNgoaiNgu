"use client";

import { useMemo, useState } from "react";
import { topikQuestionNoMax } from "@/lib/topik-question-limits";
import {
  topikQuestionTypeLabel,
  topikSectionLabel,
  topikTierLabel,
} from "@/lib/topik-labels";
import type {
  TopikQuestionType,
  TopikSection,
  TopikTier,
  TopikWritingPart,
} from "@/lib/types";
import { DEFAULT_SHORT_ANSWER_PARTS } from "@/lib/topik-writing-parts";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

export type TopikQuestionFormValues = {
  tier: TopikTier;
  section: TopikSection;
  questionNo: number;
  questionType: TopikQuestionType;
  prompt: string;
  passage: string | null;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  optionImageUrls: string[];
  bundleId: string | null;
  modelAnswer: string | null;
  writingParts: TopikWritingPart[] | null;
  minChars: number | null;
  maxChars: number | null;
  maxScore: number | null;
  rubric: Record<string, unknown> | null;
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
  const [questionType, setQuestionType] = useState<TopikQuestionType>(
    initial.questionType,
  );
  const [questionNo, setQuestionNo] = useState(String(initial.questionNo));
  const [prompt, setPrompt] = useState(initial.prompt);
  const [passage, setPassage] = useState(initial.passage ?? "");
  const [options, setOptions] = useState<string[]>(
    initial.options.length >= 2 ? initial.options : ["", "", "", ""],
  );
  const [correctIndex, setCorrectIndex] = useState(initial.correctIndex);
  const [explanation, setExplanation] = useState(initial.explanation ?? "");
  const [audioUrl, setAudioUrl] = useState(initial.audioUrl ?? "");
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [optionImageUrls, setOptionImageUrls] = useState<string[]>(() =>
    padOptionImageUrls(initial.optionImageUrls, initial.options.length),
  );
  const [bundleId, setBundleId] = useState(initial.bundleId ?? "");
  const [modelAnswer, setModelAnswer] = useState(initial.modelAnswer ?? "");
  const [writingParts, setWritingParts] = useState<TopikWritingPart[]>(
    initial.writingParts?.length
      ? initial.writingParts
      : initial.section === "WRITING" &&
          initial.questionType === "SHORT_ANSWER"
        ? DEFAULT_SHORT_ANSWER_PARTS
        : [],
  );
  const [minChars, setMinChars] = useState(
    initial.minChars != null ? String(initial.minChars) : "",
  );
  const [maxChars, setMaxChars] = useState(
    initial.maxChars != null ? String(initial.maxChars) : "",
  );
  const [maxScore, setMaxScore] = useState(
    initial.maxScore != null ? String(initial.maxScore) : "",
  );
  const [rubricJson, setRubricJson] = useState(
    initial.rubric ? JSON.stringify(initial.rubric, null, 2) : "",
  );
  const [points, setPoints] = useState(String(initial.points));
  const [isPublished, setIsPublished] = useState(initial.isPublished);

  const isMcq = questionType === "MULTIPLE_CHOICE";
  const isWriting = section === "WRITING";

  const questionNoMax = useMemo(
    () => topikQuestionNoMax(tier, section),
    [tier, section],
  );

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function updateOptionImage(index: number, value: string) {
    setOptionImageUrls((prev) => {
      const next = padOptionImageUrls(prev, options.length);
      next[index] = value;
      return next;
    });
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
    setOptionImageUrls((prev) => [...padOptionImageUrls(prev, options.length), ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setOptionImageUrls((prev) =>
      padOptionImageUrls(prev, options.length).filter((_, i) => i !== index),
    );
    setCorrectIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  }

  function handleQuestionTypeChange(next: TopikQuestionType) {
    setQuestionType(next);
    if (next === "SHORT_ANSWER" && writingParts.length === 0) {
      setWritingParts(DEFAULT_SHORT_ANSWER_PARTS);
    }
  }

  function updateWritingPart(
    index: number,
    patch: Partial<TopikWritingPart>,
  ) {
    setWritingParts((prev) =>
      prev.map((part, i) => (i === index ? { ...part, ...patch } : part)),
    );
  }

  function handleSectionChange(next: TopikSection) {
    setSection(next);
    if (next === "WRITING") {
      setQuestionType((t) =>
        t === "MULTIPLE_CHOICE" ? "SHORT_ANSWER" : t,
      );
      setWritingParts((prev) =>
        prev.length > 0 ? prev : DEFAULT_SHORT_ANSWER_PARTS,
      );
    } else {
      setQuestionType("MULTIPLE_CHOICE");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let rubric: Record<string, unknown> | null = null;
    if (rubricJson.trim()) {
      try {
        rubric = JSON.parse(rubricJson) as Record<string, unknown>;
      } catch {
        alert("Rubric phải là JSON hợp lệ");
        return;
      }
    }
    void onSubmit({
      tier,
      section,
      questionNo: parseInt(questionNo, 10) || 1,
      questionType: isWriting ? questionType : "MULTIPLE_CHOICE",
      prompt: prompt.trim(),
      passage: passage.trim() || null,
      options: isMcq ? options.map((o) => o.trim()).filter(Boolean) : [],
      correctIndex: isMcq ? correctIndex : 0,
      explanation: explanation.trim() || null,
      audioUrl:
        section === "LISTENING" && audioUrl.trim() ? audioUrl.trim() : null,
      imageUrl: imageUrl.trim() || null,
      optionImageUrls: isMcq
        ? padOptionImageUrls(optionImageUrls, options.length)
            .map((url) => url.trim())
            .filter(Boolean)
        : [],
      bundleId: bundleId.trim() || null,
      modelAnswer:
        questionType === "ESSAY" ? modelAnswer.trim() || null : null,
      writingParts:
        questionType === "SHORT_ANSWER" && writingParts.length > 0
          ? writingParts.map((p) => ({
              label: p.label.trim(),
              ...(p.modelAnswer?.trim() && {
                modelAnswer: p.modelAnswer.trim(),
              }),
              ...(p.maxScore != null && { maxScore: p.maxScore }),
            }))
          : null,
      minChars: minChars.trim() ? parseInt(minChars, 10) : null,
      maxChars: maxChars.trim() ? parseInt(maxChars, 10) : null,
      maxScore: maxScore.trim() ? parseInt(maxScore, 10) : null,
      rubric,
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
            onChange={(e) =>
              handleSectionChange(e.target.value as TopikSection)
            }
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

      {isWriting ? (
        <label className="flex flex-col gap-1 text-sm">
          <span>Loại câu viết</span>
          <select
            value={questionType}
            onChange={(e) =>
              handleQuestionTypeChange(e.target.value as TopikQuestionType)
            }
            className={inputClass}
          >
            <option value="SHORT_ANSWER">
              {topikQuestionTypeLabel("SHORT_ANSWER")}
            </option>
            <option value="ESSAY">{topikQuestionTypeLabel("ESSAY")}</option>
          </select>
        </label>
      ) : null}

      {isWriting ? (
        <div className="flex flex-col gap-3 rounded-md border border-dashed border-sky-300 p-3 dark:border-sky-900">
          <p className="text-xs font-medium text-sky-800 dark:text-sky-300">
            Câu viết — 51–52: 2 ý (㉠, ㉡) qua writingParts; 53–54: viết luận
          </p>

          {questionType === "SHORT_ANSWER" ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">
                Các ý nhỏ (㉠, ㉡…)
              </legend>
              {writingParts.map((part, i) => (
                <div
                  key={i}
                  className="grid gap-2 rounded-md border border-sky-100 p-2 dark:border-sky-900 sm:grid-cols-3"
                >
                  <input
                    value={part.label}
                    onChange={(e) =>
                      updateWritingPart(i, { label: e.target.value })
                    }
                    placeholder="㉠"
                    className={inputClass}
                  />
                  <input
                    value={part.modelAnswer ?? ""}
                    onChange={(e) =>
                      updateWritingPart(i, { modelAnswer: e.target.value })
                    }
                    placeholder="Đáp án mẫu"
                    className={`${inputClass} sm:col-span-2`}
                  />
                </div>
              ))}
            </fieldset>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              <span>Đáp án mẫu (viết luận)</span>
              <textarea
                rows={4}
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                className={inputClass}
              />
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span>Min ký tự</span>
              <input
                type="number"
                min={0}
                value={minChars}
                onChange={(e) => setMinChars(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Max ký tự</span>
              <input
                type="number"
                min={1}
                value={maxChars}
                onChange={(e) => setMaxChars(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Điểm tối đa</span>
              <input
                type="number"
                min={1}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="10 / 30 / 50"
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span>Rubric (JSON, tùy chọn — dùng cho AI chấm sau)</span>
            <textarea
              rows={4}
              value={rubricJson}
              onChange={(e) => setRubricJson(e.target.value)}
              placeholder='{"criteria":[...]}'
              className={`${inputClass} font-mono text-xs`}
            />
          </label>
        </div>
      ) : null}

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

      <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
        <label className="flex flex-col gap-1 text-sm">
          <span>URL ảnh đề bài / đoạn văn</span>
          <input
            type="url"
            placeholder="https://... (bảng, thông báo, biểu đồ)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputClass}
          />
        </label>
        {imageUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl.trim()}
            alt="Xem trước ảnh đề"
            className="max-h-64 w-full rounded-md border border-zinc-200 object-contain dark:border-zinc-700"
          />
        ) : (
          <p className="text-xs text-zinc-500">
            Dùng cho đoạn đọc có bảng/hình hoặc minh họa trên câu hỏi.
          </p>
        )}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>Bundle ID (tùy chọn)</span>
        <input
          value={bundleId}
          onChange={(e) => setBundleId(e.target.value)}
          placeholder="vd. listen-25-26 — cùng ID cho cặp câu 25–26"
          className={inputClass}
        />
        <span className="text-xs text-zinc-500">
          Hai câu cùng bundleId (liền kề trong đề) hiển thị chung một trang và
          một audio.
        </span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Đáp án</legend>
        {!isMcq ? (
          <p className="text-xs text-zinc-500">
            Câu viết không dùng đáp án trắc nghiệm.
          </p>
        ) : (
          <>
        {options.map((opt, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-md border border-zinc-100 p-2 dark:border-zinc-800">
            <div className="flex items-center gap-2">
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
            <input
              type="url"
              value={padOptionImageUrls(optionImageUrls, options.length)[i] ?? ""}
              onChange={(e) => updateOptionImage(i, e.target.value)}
              placeholder={`URL ảnh đáp án ${i + 1} (tùy chọn)`}
              className={inputClass}
            />
            {padOptionImageUrls(optionImageUrls, options.length)[i]?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={padOptionImageUrls(optionImageUrls, options.length)[i].trim()}
                alt={`Xem trước đáp án ${i + 1}`}
                className="max-h-32 rounded-md border border-zinc-200 object-contain dark:border-zinc-700"
              />
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
          </>
        )}
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

function padOptionImageUrls(urls: string[] | undefined, length: number): string[] {
  return Array.from({ length: Math.max(length, 2) }, (_, i) => urls?.[i] ?? "");
}
