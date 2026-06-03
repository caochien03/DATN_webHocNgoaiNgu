import type { GrammarLevel } from "./types";

export const GRAMMAR_LEVELS: { code: GrammarLevel; label: string }[] = [
  { code: "BEGINNER_1", label: "Sơ cấp 1" },
  { code: "BEGINNER_2", label: "Sơ cấp 2" },
  { code: "INTERMEDIATE_1", label: "Trung cấp 1" },
  { code: "INTERMEDIATE_2", label: "Trung cấp 2" },
  { code: "ADVANCED_1", label: "Cao cấp 1" },
  { code: "ADVANCED_2", label: "Cao cấp 2" },
];

export function grammarLevelLabel(code: GrammarLevel): string {
  return GRAMMAR_LEVELS.find((l) => l.code === code)?.label ?? code;
}
