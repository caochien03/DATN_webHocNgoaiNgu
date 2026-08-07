import { BadRequestException } from '@nestjs/common';
import { ToeicSection, ToeicTier } from '@prisma/client';

const MAX_QUESTION_NO: Record<ToeicSection, number> = {
  [ToeicSection.LISTENING]: 100,
  [ToeicSection.READING]: 100,
};

export function assertValidQuestionNo(
  _tier: ToeicTier,
  section: ToeicSection,
  questionNo: number,
) {
  const max = MAX_QUESTION_NO[section];
  if (questionNo < 1 || questionNo > max) {
    throw new BadRequestException(
      `questionNo must be between 1 and ${max} for ${section}`,
    );
  }
}

export function validateOptions(correctIndex: number, options: string[]) {
  if (options.length < 2) {
    throw new BadRequestException('options must have at least 2 items');
  }
  if (correctIndex < 0 || correctIndex >= options.length) {
    throw new BadRequestException('correctIndex is out of range for options');
  }
}
