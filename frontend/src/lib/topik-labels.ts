import type { TopikQuestionType, TopikSection, TopikTier } from "@/lib/types";

export function topikQuestionTypeLabel(type: TopikQuestionType): string {
  if (type === "SHORT_ANSWER") return "Điền / câu ngắn";
  if (type === "ESSAY") return "Viết luận";
  return "Trắc nghiệm";
}

export function topikSectionLabel(section: TopikSection): string {
  if (section === "LISTENING") return "Nghe";
  if (section === "READING") return "Đọc";
  return "Viết";
}

export function topikTierLabel(tier: TopikTier): string {
  if (tier === "TOPIK_I") return "TOPIK I";
  return "TOPIK II";
}

export function topikAttemptModeLabel(mode: "FULL_EXAM" | "PRACTICE"): string {
  return mode === "FULL_EXAM" ? "Thi thử" : "Luyện dạng";
}
