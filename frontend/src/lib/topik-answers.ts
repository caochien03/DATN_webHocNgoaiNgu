import {
  DEFAULT_SHORT_ANSWER_PARTS,
  getWritingPartCount,
} from "@/lib/topik-writing-parts";
import type { TopikQuestion } from "@/lib/types";

export type TopikAnswerPayload = {
  questionId: string;
  selectedIndex?: number;
  textAnswer?: string;
  textAnswers?: string[];
};

export function isWritingQuestion(question: TopikQuestion): boolean {
  return (
    question.questionType === "SHORT_ANSWER" ||
    question.questionType === "ESSAY"
  );
}

export type WritingAnswerState = Record<string, string | string[]>;

export function initWritingAnswerState(
  questions: TopikQuestion[],
): WritingAnswerState {
  const state: WritingAnswerState = {};
  for (const q of questions) {
    if (!isWritingQuestion(q)) continue;
    if (getWritingPartCount(q) > 1) {
      const parts =
        q.writingParts && q.writingParts.length > 0
          ? q.writingParts
          : DEFAULT_SHORT_ANSWER_PARTS;
      state[q.id] = parts.map(() => "");
    } else {
      state[q.id] = "";
    }
  }
  return state;
}

export function isWritingAnswerComplete(
  question: TopikQuestion,
  state: WritingAnswerState,
): boolean {
  const val = state[question.id];
  if (val === undefined) return false;
  if (Array.isArray(val)) {
    return val.every((t) => t.trim().length > 0);
  }
  return val.trim().length > 0;
}

export function buildTopikSubmitAnswers(
  questions: TopikQuestion[],
  mcqSelections: Record<string, number>,
  writingAnswers: WritingAnswerState,
): TopikAnswerPayload[] {
  return questions.map((q) => {
    if (isWritingQuestion(q)) {
      const val = writingAnswers[q.id];
      if (Array.isArray(val)) {
        return {
          questionId: q.id,
          textAnswers: val.map((t) => t.trim()),
        };
      }
      return {
        questionId: q.id,
        textAnswer: (val as string).trim(),
      };
    }
    return {
      questionId: q.id,
      selectedIndex: mcqSelections[q.id]!,
    };
  });
}
