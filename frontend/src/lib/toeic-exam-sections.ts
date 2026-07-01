import type { ToeicSection } from "@/lib/types";
import { toeicSectionLabel } from "@/lib/toeic-labels";

export type ToeicSectionCounts = Partial<Record<ToeicSection, number>>;

export function formatToeicSectionCounts(counts: ToeicSectionCounts): string {
  const parts: string[] = [];
  if (counts.LISTENING) parts.push(`${toeicSectionLabel("LISTENING")} ${counts.LISTENING}`);
  if (counts.READING) parts.push(`${toeicSectionLabel("READING")} ${counts.READING}`);
  return parts.join(" · ");
}
