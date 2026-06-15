export type TopikWritingPart = {
  label: string;
  modelAnswer?: string;
  maxScore?: number;
};

export const DEFAULT_SHORT_ANSWER_PARTS: TopikWritingPart[] = [
  { label: "㉠", maxScore: 5 },
  { label: "㉡", maxScore: 5 },
];

export function getWritingPartCount(question: {
  questionType: string;
  writingParts?: TopikWritingPart[] | null;
}): number {
  if (question.questionType === "ESSAY") return 1;
  if (question.writingParts && question.writingParts.length > 0) {
    return question.writingParts.length;
  }
  return 1;
}
