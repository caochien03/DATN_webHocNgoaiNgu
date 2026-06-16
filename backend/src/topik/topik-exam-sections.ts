import { TopikSection } from '@prisma/client';

type QuestionWithSection = { section: TopikSection };

export function countQuestionsBySection<T extends QuestionWithSection>(
  questions: T[],
): Partial<Record<TopikSection, number>> {
  const counts: Partial<Record<TopikSection, number>> = {};
  for (const q of questions) {
    counts[q.section] = (counts[q.section] ?? 0) + 1;
  }
  return counts;
}
