import { TopikSection, TopikTier } from '@prisma/client';

export type TopikExamSectionRange = {
  section: TopikSection;
  fromNo: number;
  toNo: number;
};

/** Cấu trúc đề thi thử theo cấp độ — rút ngẫu nhiên 1 câu / số câu trong ngân hàng. */
export const TOPIK_EXAM_BLUEPRINT: Record<
  TopikTier,
  TopikExamSectionRange[]
> = {
  [TopikTier.TOPIK_I]: [
    { section: TopikSection.LISTENING, fromNo: 1, toNo: 30 },
    { section: TopikSection.READING, fromNo: 1, toNo: 40 },
  ],
  [TopikTier.TOPIK_II]: [
    { section: TopikSection.LISTENING, fromNo: 1, toNo: 50 },
    { section: TopikSection.READING, fromNo: 1, toNo: 50 },
  ],
};

export function topikExamQuestionCount(tier: TopikTier): number {
  return TOPIK_EXAM_BLUEPRINT[tier].reduce(
    (sum, r) => sum + (r.toNo - r.fromNo + 1),
    0,
  );
}
