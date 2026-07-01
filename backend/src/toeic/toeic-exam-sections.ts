import { ToeicSection } from '@prisma/client';

type SectionCountable = { section: ToeicSection };

export function countQuestionsBySection(
  questions: SectionCountable[],
): Partial<Record<ToeicSection, number>> {
  const counts: Partial<Record<ToeicSection, number>> = {};
  for (const q of questions) {
    counts[q.section] = (counts[q.section] ?? 0) + 1;
  }
  return counts;
}
