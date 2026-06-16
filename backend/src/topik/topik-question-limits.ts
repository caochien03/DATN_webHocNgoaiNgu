import { BadRequestException } from '@nestjs/common';
import { TopikSection, TopikTier } from '@prisma/client';

const MAX_QUESTION_NO: Record<
  TopikTier,
  Partial<Record<TopikSection, number>>
> = {
  [TopikTier.TOPIK_I]: {
    [TopikSection.LISTENING]: 30,
    [TopikSection.READING]: 40,
  },
  [TopikTier.TOPIK_II]: {
    [TopikSection.LISTENING]: 50,
    [TopikSection.READING]: 50,
    [TopikSection.WRITING]: 54,
  },
};

function isValidWritingQuestionNo(tier: TopikTier, questionNo: number): boolean {
  if (tier !== TopikTier.TOPIK_II) {
    return questionNo >= 1 && questionNo <= 4;
  }
  return (
    (questionNo >= 1 && questionNo <= 4) ||
    (questionNo >= 51 && questionNo <= 54)
  );
}

export function assertValidQuestionNo(
  tier: TopikTier,
  section: TopikSection,
  questionNo: number,
) {
  if (section === TopikSection.WRITING) {
    if (!isValidWritingQuestionNo(tier, questionNo)) {
      throw new BadRequestException(
        `questionNo for ${tier} WRITING must be 1–4 or 51–54`,
      );
    }
    return;
  }

  const max = MAX_QUESTION_NO[tier][section];
  if (max === undefined) {
    throw new BadRequestException(
      `Section ${section} is not supported for ${tier}`,
    );
  }
  if (questionNo < 1 || questionNo > max) {
    throw new BadRequestException(
      `questionNo must be between 1 and ${max} for ${tier} ${section}`,
    );
  }
}

export function validateOptions(correctIndex: number, options: string[]) {
  if (options.length < 2) {
    throw new BadRequestException('options must have at least 2 items');
  }
  if (correctIndex < 0 || correctIndex >= options.length) {
    throw new BadRequestException(
      'correctIndex is out of range for options',
    );
  }
}
