import type { ToeicSection } from "@/lib/types";

export function toeicSectionLabel(section: ToeicSection): string {
  if (section === "LISTENING") return "Nghe";
  return "Đọc";
}

export function toeicTierLabel(tier: "TOEIC_LR"): string {
  void tier;
  return "TOEIC Listening & Reading";
}

export function toeicAttemptModeLabel(mode: "FULL_EXAM" | "PRACTICE"): string {
  return mode === "FULL_EXAM" ? "Thi thử" : "Luyện Part";
}

export function toeicPartLabel(part: number): string {
  return `Part ${part}`;
}
