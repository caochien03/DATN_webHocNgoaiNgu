"use client";

import { useMemo, useState } from "react";
import { topikQuestionNoMax } from "@/lib/topik-question-limits";
import { topikSectionLabel } from "@/lib/topik-labels";
import type { ExamQuestionInput, TopikSection, TopikTier } from "@/lib/types";

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

  function patch(partial: Partial<ExamQuestionInput>) {
    onChange({ ...value, ...partial });
  }

  function updateOption(i: number, text: string) {
    patch({
      options: value.options.map((o, idx) => (idx === i ? text : o)),
    });
  }

  function addOption() {
    patch({ options: [...value.options, ""] });
  }

  function removeOption(i: number) {
    if (value.options.length <= 2) return;
    const options = value.options.filter((_, idx) => idx !== i);
    let correctIndex = value.correctIndex;
    if (correctIndex === i) correctIndex = 0;
    else if (correctIndex > i) correctIndex -= 1;
    patch({ options, correctIndex });
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
                  patch({
                    section: e.target.value as TopikSection,
                  })
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

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Đáp án</legend>
            {value.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
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
                {value.options.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-xs text-red-600 hover:underline"
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
  return questions.map((q, i) => ({
    ...q,
    sortOrder: q.sortOrder ?? i,
    prompt: q.prompt.trim(),
    options: q.options.map((o) => o.trim()).filter(Boolean),
    passage: q.passage?.trim() || undefined,
    explanation: q.explanation?.trim() || undefined,
    audioUrl:
      q.section === "LISTENING" && q.audioUrl?.trim()
        ? q.audioUrl.trim()
        : undefined,
  }));
}
