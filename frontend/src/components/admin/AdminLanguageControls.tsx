"use client";

import { inputClass } from "@/components/ui-kit/form-styles";
import {
  LEARNING_LANGUAGE_OPTIONS,
  learningLanguageLabel,
  type LearningLanguageCode,
} from "@/lib/learning-language";

export type AdminLanguageFilterValue = "" | LearningLanguageCode;

type FilterProps = {
  value: AdminLanguageFilterValue;
  onChange: (value: AdminLanguageFilterValue) => void;
  className?: string;
};

export function AdminLanguageFilter({
  value,
  onChange,
  className,
}: FilterProps) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className ?? ""}`}>
      <span className="text-muted-foreground">Lọc theo ngôn ngữ</span>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value as AdminLanguageFilterValue)
        }
        className={inputClass}
      >
        <option value="">Tất cả ngôn ngữ</option>
        {LEARNING_LANGUAGE_OPTIONS.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nameVi}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminLanguageBadge({ code }: { code: string }) {
  const color =
    code === "ko"
      ? "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300"
      : "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color}`}
    >
      {learningLanguageLabel(code)}
    </span>
  );
}

type SelectProps = {
  value: string;
  onChange: (value: LearningLanguageCode) => void;
  disabled?: boolean;
  label?: string;
};

export function AdminLanguageSelect({
  value,
  onChange,
  disabled = false,
  label = "Ngôn ngữ *",
}: SelectProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as LearningLanguageCode)}
        className={inputClass}
      >
        {LEARNING_LANGUAGE_OPTIONS.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nameVi} ({language.code})
          </option>
        ))}
      </select>
      {disabled ? (
        <span className="text-xs text-muted-foreground">
          Không thể đổi ngôn ngữ khi nội dung đã được liên kết.
        </span>
      ) : null}
    </label>
  );
}
