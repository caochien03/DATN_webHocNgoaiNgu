import { BadRequestException } from '@nestjs/common';
import { TopikQuestionType, TopikSection, TopikTier } from '@prisma/client';
import { validateOptions } from './topik-question-limits';
import { parseWritingParts } from './topik-writing-parts';

export function assertQuestionInput(params: {
  tier: TopikTier;
  section: TopikSection;
  questionType: TopikQuestionType;
  options: string[];
  correctIndex: number;
  minChars?: number | null;
  maxChars?: number | null;
  writingParts?: unknown;
}) {
  if (params.section === TopikSection.WRITING) {
    if (params.questionType === TopikQuestionType.MULTIPLE_CHOICE) {
      throw new BadRequestException(
        'Phần Viết cần questionType SHORT_ANSWER hoặc ESSAY',
      );
    }
  } else if (params.questionType !== TopikQuestionType.MULTIPLE_CHOICE) {
    throw new BadRequestException(
      `${params.section} chỉ hỗ trợ questionType MULTIPLE_CHOICE`,
    );
  }

  if (params.questionType === TopikQuestionType.MULTIPLE_CHOICE) {
    validateOptions(params.correctIndex, params.options);
    return;
  }

  if (
    params.minChars != null &&
    params.maxChars != null &&
    params.minChars > params.maxChars
  ) {
    throw new BadRequestException('minChars must be <= maxChars');
  }

  if (params.questionType === TopikQuestionType.SHORT_ANSWER) {
    parseWritingParts(params.writingParts ?? null);
  }
}

export function isWritingQuestionType(type: TopikQuestionType): boolean {
  return (
    type === TopikQuestionType.SHORT_ANSWER || type === TopikQuestionType.ESSAY
  );
}
