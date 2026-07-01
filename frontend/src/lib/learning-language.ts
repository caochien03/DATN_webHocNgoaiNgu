export type LearningLanguageCode = "ko" | "en";

export type LearningLanguageOption = {
  code: LearningLanguageCode;
  nameVi: string;
};

export const LEARNING_LANGUAGE_OPTIONS: LearningLanguageOption[] = [
  { code: "ko", nameVi: "Tiếng Hàn" },
  { code: "en", nameVi: "Tiếng Anh" },
];

export const DEFAULT_LEARNING_LANGUAGE: LearningLanguageCode = "ko";

export const LEARNING_LANGUAGE_STORAGE_KEY = "datn-learning-language";

export function learningLanguageLabel(code: string): string {
  return (
    LEARNING_LANGUAGE_OPTIONS.find((l) => l.code === code)?.nameVi ?? code
  );
}

export function isLearningLanguageCode(
  code: string,
): code is LearningLanguageCode {
  return LEARNING_LANGUAGE_OPTIONS.some((l) => l.code === code);
}

export function readStoredLearningLanguage(): LearningLanguageCode {
  if (typeof window === "undefined") return DEFAULT_LEARNING_LANGUAGE;
  const raw = localStorage.getItem(LEARNING_LANGUAGE_STORAGE_KEY);
  return raw && isLearningLanguageCode(raw) ? raw : DEFAULT_LEARNING_LANGUAGE;
}

export function writeStoredLearningLanguage(code: LearningLanguageCode): void {
  localStorage.setItem(LEARNING_LANGUAGE_STORAGE_KEY, code);
}
