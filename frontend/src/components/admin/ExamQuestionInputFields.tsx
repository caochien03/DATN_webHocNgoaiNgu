"use client";

import { useMemo, useState } from "react";
import { topikQuestionNoMax } from "@/lib/topik-question-limits";
import { topikQuestionTypeLabel, topikSectionLabel } from "@/lib/topik-labels";
import type {
  ExamQuestionInput,
  TopikQuestionType,
  TopikSection,
  TopikTier,
} from "@/lib/types";
import {
  DEFAULT_SHORT_ANSWER_PARTS,
  type TopikWritingPart,
} from "@/lib/topik-writing-parts";

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

type ExamQuestionInputFieldsProps = {
  tier: TopikTier;
  index: number;
  value: ExamQuestionInput;
  onChange: (value: ExamQuestionInput) => void;
  onRemove?: () => void;
  defaultOpen?: boolean;
};

export function emptyExamQuestion(sortOrder: number): ExamQuestionInput {
  return {
    sortOrder,
    section: "LISTENING",
    questionNo: 1,
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    points: 2,
  };
}

export function ExamQuestionInputFields({
  tier,
  index,
  value,
  onChange,
  onRemove,
  defaultOpen = false,
}: ExamQuestionInputFieldsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const questionNoMax = useMemo(
    () => topikQuestionNoMax(tier, value.section),
    [tier, value.section],
  );

  const options = value.options ?? ["", "", "", ""];
  const questionType: TopikQuestionType =
    value.questionType ??
    (value.section === "WRITING" ? "SHORT_ANSWER" : "MULTIPLE_CHOICE");
  const isMcq = questionType === "MULTIPLE_CHOICE";
  const isWriting = value.section === "WRITING";

  function patch(partial: Partial<ExamQuestionInput>) {
    onChange({ ...value, ...partial });
  }

  function handleSectionChange(section: TopikSection) {
    if (section === "WRITING") {
      patch({
        section,
        questionType:
          questionType === "MULTIPLE_CHOICE" ? "SHORT_ANSWER" : questionType,
        writingParts:
          value.writingParts && value.writingParts.length > 0
            ? value.writingParts
            : DEFAULT_SHORT_ANSWER_PARTS,
      });
    } else {
      patch({ section, questionType: "MULTIPLE_CHOICE", writingParts: undefined });
    }
  }

  function updateWritingPart(index: number, partial: Partial<TopikWritingPart>) {
    const parts = value.writingParts ?? DEFAULT_SHORT_ANSWER_PARTS;
    patch({
      writingParts: parts.map((p, i) =>
        i === index ? { ...p, ...partial } : p,
      ),
    });
  }

  function updateOption(i: number, text: string) {
    patch({
      options: options.map((o, idx) => (idx === i ? text : o)),
    });
  }

  function updateOptionImage(i: number, url: string) {
    const urls = padUrls(value.optionImageUrls, options.length);
    urls[i] = url;
    patch({ optionImageUrls: urls });
  }

  function addOption() {
    patch({
      options: [...options, ""],
      optionImageUrls: [...padUrls(value.optionImageUrls, options.length), ""],
    });
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    const nextOptions = options.filter((_, idx) => idx !== i);
    const optionImageUrls = padUrls(value.optionImageUrls, options.length).filter(
      (_, idx) => idx !== i,
    );
    let correctIndex = value.correctIndex ?? 0;
    if (correctIndex === i) correctIndex = 0;
    else if (correctIndex > i) correctIndex -= 1;
    patch({ options: nextOptions, optionImageUrls, correctIndex });
  }

  const summary = value.prompt.trim()
    ? value.prompt.trim().slice(0, 60)
    : "Chưa có đề bài";

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Câu #{index + 1} · {topikSectionLabel(value.section)} · số{" "}
            {value.questionNo}
          </p>
          <p className="truncate text-xs text-zinc-500">{summary}</p>
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-600 hover:underline"
          >
            Xóa
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="flex flex-col gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span>Thứ tự trong đề</span>
              <input
                type="number"
                min={0}
                value={value.sortOrder}
                onChange={(e) =>
                  patch({ sortOrder: parseInt(e.target.value, 10) || 0 })
                }
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Phần thi</span>
              <select
                value={value.section}
                onChange={(e) =>
                  handleSectionChange(e.target.value as TopikSection)
                }
                className={inputClass}
              >
                <option value="LISTENING">
                  {topikSectionLabel("LISTENING")}
                </option>
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
                value={value.questionNo}
                onChange={(e) =>
                  patch({ questionNo: parseInt(e.target.value, 10) || 1 })
                }
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
                  patch({
                    questionType: e.target.value as TopikQuestionType,
                  })
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

          <label className="flex flex-col gap-1 text-sm">
            <span>Đề bài</span>
            <textarea
              required
              rows={2}
              value={value.prompt}
              onChange={(e) => patch({ prompt: e.target.value })}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Đoạn văn / hội thoại (tùy chọn)</span>
            <textarea
              rows={2}
              value={value.passage ?? ""}
              onChange={(e) =>
                patch({ passage: e.target.value.trim() || undefined })
              }
              className={inputClass}
            />
          </label>

          {value.section === "LISTENING" ? (
            <label className="flex flex-col gap-1 text-sm">
              <span>URL file nghe</span>
              <input
                type="url"
                value={value.audioUrl ?? ""}
                onChange={(e) =>
                  patch({ audioUrl: e.target.value.trim() || undefined })
                }
                className={inputClass}
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-1 text-sm">
            <span>URL ảnh đề bài / đoạn văn</span>
            <input
              type="url"
              value={value.imageUrl ?? ""}
              onChange={(e) =>
                patch({ imageUrl: e.target.value.trim() || undefined })
              }
              placeholder="https://..."
              className={inputClass}
            />
          </label>

          {isWriting ? (
            <>
              {questionType === "SHORT_ANSWER" ? (
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm font-medium">
                    Các ý nhỏ (㉠, ㉡…)
                  </legend>
                  {(value.writingParts ?? DEFAULT_SHORT_ANSWER_PARTS).map(
                    (part, i) => (
                      <div
                        key={i}
                        className="grid gap-2 sm:grid-cols-3"
                      >
                        <input
                          value={part.label}
                          onChange={(e) =>
                            updateWritingPart(i, { label: e.target.value })
                          }
                          className={inputClass}
                        />
                        <input
                          value={part.modelAnswer ?? ""}
                          onChange={(e) =>
                            updateWritingPart(i, {
                              modelAnswer: e.target.value,
                            })
                          }
                          placeholder="Đáp án mẫu"
                          className={`${inputClass} sm:col-span-2`}
                        />
                      </div>
                    ),
                  )}
                </fieldset>
              ) : (
                <label className="flex flex-col gap-1 text-sm">
                  <span>Đáp án mẫu (viết luận)</span>
                  <textarea
                    rows={3}
                    value={value.modelAnswer ?? ""}
                    onChange={(e) =>
                      patch({
                        modelAnswer: e.target.value.trim() || undefined,
                      })
                    }
                    className={inputClass}
                  />
                </label>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                {questionType === "ESSAY" ? (
                  <>
                    <label className="flex flex-col gap-1 text-sm">
                      <span>Min ký tự</span>
                      <input
                        type="number"
                        min={0}
                        value={value.minChars ?? ""}
                        onChange={(e) =>
                          patch({
                            minChars: e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined,
                          })
                        }
                        className={inputClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span>Max ký tự</span>
                      <input
                        type="number"
                        min={1}
                        value={value.maxChars ?? ""}
                        onChange={(e) =>
                          patch({
                            maxChars: e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined,
                          })
                        }
                        className={inputClass}
                      />
                    </label>
                  </>
                ) : null}
                <label className="flex flex-col gap-1 text-sm">
                  <span>Điểm tối đa</span>
                  <input
                    type="number"
                    min={1}
                    value={value.maxScore ?? ""}
                    onChange={(e) =>
                      patch({
                        maxScore: e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined,
                      })
                    }
                    className={inputClass}
                  />
                </label>
              </div>
            </>
          ) : null}

          <label className="flex flex-col gap-1 text-sm">
            <span>Bundle ID (tùy chọn)</span>
            <input
              value={value.bundleId ?? ""}
              onChange={(e) =>
                patch({ bundleId: e.target.value.trim() || undefined })
              }
              placeholder="Cùng ID cho cặp câu 25–26"
              className={inputClass}
            />
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
              <div
                key={i}
                className="flex flex-col gap-2 rounded-md border border-zinc-100 p-2 dark:border-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={value.correctIndex === i}
                    onChange={() => patch({ correctIndex: i })}
                  />
                  <input
                    required
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                  {options.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  ) : null}
                </div>
                <input
                  type="url"
                  value={padUrls(value.optionImageUrls, options.length)[i] ?? ""}
                  onChange={(e) => updateOptionImage(i, e.target.value)}
                  placeholder={`URL ảnh đáp án ${i + 1}`}
                  className={inputClass}
                />
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
              value={value.explanation ?? ""}
              onChange={(e) =>
                patch({ explanation: e.target.value.trim() || undefined })
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm sm:max-w-xs">
            <span>Điểm</span>
            <input
              type="number"
              min={1}
              value={value.points ?? 2}
              onChange={(e) =>
                patch({ points: parseInt(e.target.value, 10) || 2 })
              }
              className={inputClass}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

export function normalizeExamQuestions(
  questions: ExamQuestionInput[],
): ExamQuestionInput[] {
  return questions.map((q, i) => {
    const questionType =
      q.questionType ??
      (q.section === "WRITING" ? "SHORT_ANSWER" : "MULTIPLE_CHOICE");
    const isMcq = questionType === "MULTIPLE_CHOICE";
    return {
      ...q,
      sortOrder: q.sortOrder ?? i,
      questionType,
      prompt: q.prompt.trim(),
      options: isMcq
        ? (q.options ?? []).map((o) => o.trim()).filter(Boolean)
        : [],
      correctIndex: isMcq ? (q.correctIndex ?? 0) : 0,
      passage: q.passage?.trim() || undefined,
      explanation: q.explanation?.trim() || undefined,
      audioUrl:
        q.section === "LISTENING" && q.audioUrl?.trim()
          ? q.audioUrl.trim()
          : undefined,
      imageUrl: q.imageUrl?.trim() || undefined,
      optionImageUrls: isMcq
        ? q.optionImageUrls?.map((url) => url.trim()).filter(Boolean)
        : undefined,
      bundleId: q.bundleId?.trim() || undefined,
      modelAnswer: q.modelAnswer?.trim() || undefined,
      writingParts:
        q.writingParts && q.writingParts.length > 0 ? q.writingParts : undefined,
      minChars: q.minChars,
      maxChars: q.maxChars,
      maxScore: q.maxScore,
      rubric: q.rubric,
    };
  });
}

function padUrls(urls: string[] | undefined, length: number): string[] {
  return Array.from({ length: Math.max(length, 2) }, (_, i) => urls?.[i] ?? "");
}
