export type SupportedLanguageCode = 'ko' | 'en';

export type SupportedLanguage = {
  code: SupportedLanguageCode;
  nameVi: string;
};

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'ko', nameVi: 'Tiếng Hàn' },
  { code: 'en', nameVi: 'Tiếng Anh' },
];

const CODE_SET = new Set<string>(SUPPORTED_LANGUAGES.map((l) => l.code));

export function isSupportedLanguageCode(
  code: string,
): code is SupportedLanguageCode {
  return CODE_SET.has(code);
}

export function languageNameVi(code: string): string {
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code)?.nameVi ?? code
  );
}

export const DEFAULT_LANGUAGE_CODE: SupportedLanguageCode = 'ko';
