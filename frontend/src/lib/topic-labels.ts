export const LANGUAGE_LABELS: Record<string, string> = {
  ko: "Tiếng Hàn",
  en: "Tiếng Anh",
  vi: "Tiếng Việt",
};

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code;
}
