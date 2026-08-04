"use client";

import { inputClass } from "@/components/ui-kit/form-styles";
import { toeicSectionLabel } from "@/lib/toeic-labels";
import type { ToeicExamQuestionInput, ToeicSection } from "@/lib/types";

type Props = {
  index: number;
  value: ToeicExamQuestionInput;
  defaultOpen?: boolean;
  onChange: (value: ToeicExamQuestionInput) => void;
  onRemove?: () => void;
};

export function emptyToeicExamQuestion(index: number): ToeicExamQuestionInput {
  return {
    sortOrder: index,
    section: "LISTENING",
    questionNo: Math.min(index + 1, 100),
    prompt: "",
    passage: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
    audioUrl: "",
    imageUrl: "",
    optionImageUrls: [],
    bundleId: "",
    points: 1,
  };
}

export function normalizeToeicExamQuestions(
  questions: ToeicExamQuestionInput[],
): ToeicExamQuestionInput[] {
  return questions.map((question, index) => ({
    ...question,
    sortOrder: index,
    prompt: question.prompt.trim(),
    passage: question.passage?.trim() || undefined,
    options: question.options.map((option) => option.trim()),
    explanation: question.explanation?.trim() || undefined,
    audioUrl: question.audioUrl?.trim() || undefined,
    imageUrl: question.imageUrl?.trim() || undefined,
    optionImageUrls: question.optionImageUrls?.map((url) => url.trim()).filter(Boolean),
    bundleId: question.bundleId?.trim() || undefined,
    points: question.points || 1,
  }));
}

export function ToeicExamQuestionInputFields({
  index,
  value,
  defaultOpen = false,
  onChange,
  onRemove,
}: Props) {
  function update<K extends keyof ToeicExamQuestionInput>(
    key: K,
    nextValue: ToeicExamQuestionInput[K],
  ) {
    onChange({ ...value, [key]: nextValue });
  }

  function updateOption(optionIndex: number, option: string) {
    update(
      "options",
      value.options.map((current, currentIndex) =>
        currentIndex === optionIndex ? option : current,
      ),
    );
  }

  function addOption() {
    update("options", [...value.options, ""]);
  }

  function removeOption(optionIndex: number) {
    if (value.options.length <= 2) return;
    const options = value.options.filter((_, currentIndex) => currentIndex !== optionIndex);
    const correctIndex =
      value.correctIndex === optionIndex
        ? 0
        : value.correctIndex > optionIndex
          ? value.correctIndex - 1
          : value.correctIndex;
    onChange({ ...value, options, correctIndex });
  }

  return (
    <details
      open={defaultOpen}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <summary className="cursor-pointer text-sm font-semibold text-foreground">
        Câu {index + 1}: {value.prompt.trim() || "Chưa nhập đề bài"}
      </summary>
      <div className="mt-4 flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Kỹ năng</span>
            <select
              value={value.section}
              onChange={(event) =>
                update("section", event.target.value as ToeicSection)
              }
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
              value={value.questionNo}
              onChange={(event) =>
                update("questionNo", Number.parseInt(event.target.value, 10) || 1)
              }
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Mã nhóm câu (tùy chọn)</span>
            <input
              maxLength={120}
              value={value.bundleId ?? ""}
              onChange={(event) => update("bundleId", event.target.value)}
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
            value={value.prompt}
            onChange={(event) => update("prompt", event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Đoạn văn hoặc hội thoại (tùy chọn)</span>
          <textarea
            rows={3}
            maxLength={8000}
            value={value.passage ?? ""}
            onChange={(event) => update("passage", event.target.value)}
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
          {value.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-option-${index}`}
                checked={value.correctIndex === optionIndex}
                onChange={() => update("correctIndex", optionIndex)}
                aria-label={`Chọn đáp án ${optionIndex + 1} là đáp án đúng`}
              />
              <input
                required
                maxLength={1000}
                value={option}
                onChange={(event) => updateOption(optionIndex, event.target.value)}
                className={`${inputClass} flex-1`}
                placeholder={`Đáp án ${optionIndex + 1}`}
              />
              {value.options.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  className="text-xs text-destructive hover:underline"
                >
                  Xóa
                </button>
              ) : null}
            </div>
          ))}
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          <span>Giải thích đáp án (tùy chọn)</span>
          <textarea
            rows={2}
            maxLength={4000}
            value={value.explanation ?? ""}
            onChange={(event) => update("explanation", event.target.value)}
            className={inputClass}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>URL âm thanh (tùy chọn)</span>
            <input
              type="url"
              value={value.audioUrl ?? ""}
              onChange={(event) => update("audioUrl", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>URL hình ảnh (tùy chọn)</span>
            <input
              type="url"
              value={value.imageUrl ?? ""}
              onChange={(event) => update("imageUrl", event.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="self-start text-sm text-destructive hover:underline"
          >
            Xóa câu khỏi biểu mẫu
          </button>
        ) : null}
      </div>
    </details>
  );
}
