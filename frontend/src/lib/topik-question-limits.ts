import type { TopikSection, TopikTier } from "@/lib/types";

const MAX_QUESTION_NO: Record<
  TopikTier,
  Partial<Record<TopikSection, number>>
> = {
  TOPIK_I: { LISTENING: 30, READING: 40 },
  TOPIK_II: { LISTENING: 50, READING: 50, WRITING: 54 },
};

export function topikQuestionNoMax(
  tier: TopikTier,
  section: TopikSection,
): number | null {
  return MAX_QUESTION_NO[tier][section] ?? null;
}
