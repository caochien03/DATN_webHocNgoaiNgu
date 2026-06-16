import type { TopikQuestion, TopikSection } from "@/lib/types";

export type TopikSectionCounts = Partial<Record<TopikSection, number>>;

export function countQuestionsBySection(
  questions: TopikQuestion[],
): TopikSectionCounts {
  const counts: TopikSectionCounts = {};
  for (const q of questions) {
    counts[q.section] = (counts[q.section] ?? 0) + 1;
  }
  return counts;
}

export function formatSectionCounts(counts: TopikSectionCounts): string {
  const parts: string[] = [];
  if (counts.LISTENING) parts.push(`Nghe ${counts.LISTENING}`);
  if (counts.READING) parts.push(`Đọc ${counts.READING}`);
  if (counts.WRITING) parts.push(`Viết ${counts.WRITING}`);
  return parts.join(" · ");
}
