import { BadRequestException } from '@nestjs/common';
import { TopikQuestionType } from '@prisma/client';

export type TopikWritingPart = {
  label: string;
  modelAnswer?: string;
  maxScore?: number;
};

export type TopikWritingPartPublic = {
  label: string;
};

export function parseWritingParts(value: unknown): TopikWritingPart[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const parts: TopikWritingPart[] = [];
  for (let i = 0; i < value.length; i++) {
    const raw: unknown = value[i];
    if (typeof raw !== 'object' || raw === null) {
      throw new BadRequestException(`writingParts[${i}] must be an object`);
    }
    const label = (raw as TopikWritingPart).label;
    if (typeof label !== 'string' || !label.trim()) {
      throw new BadRequestException(`writingParts[${i}].label is required`);
    }
    parts.push({
      label: label.trim(),
      ...((raw as TopikWritingPart).modelAnswer !== undefined && {
        modelAnswer: String((raw as TopikWritingPart).modelAnswer).trim(),
      }),
      ...((raw as TopikWritingPart).maxScore !== undefined && {
        maxScore: Number((raw as TopikWritingPart).maxScore),
      }),
    });
  }
  return parts;
}

export function getWritingPartCount(question: {
  questionType: TopikQuestionType;
  writingParts?: unknown;
}): number {
  if (question.questionType === TopikQuestionType.ESSAY) return 1;
  const parts = parseWritingParts(question.writingParts);
  if (parts && parts.length > 0) return parts.length;
  return 1;
}

export function writingPartsForClient(
  writingParts: unknown,
): TopikWritingPartPublic[] | null {
  const parts = parseWritingParts(writingParts);
  if (!parts) return null;
  return parts.map((p) => ({ label: p.label }));
}

export const DEFAULT_SHORT_ANSWER_PARTS: TopikWritingPart[] = [
  { label: '㉠', maxScore: 5 },
  { label: '㉡', maxScore: 5 },
];
