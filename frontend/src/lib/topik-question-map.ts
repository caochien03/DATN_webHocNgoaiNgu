import {
  isWritingAnswerComplete,
  isWritingQuestion,
  type WritingAnswerState,
} from "@/lib/topik-answers";
import type { TopikExamStep } from "@/lib/topik-exam-steps";
import { groupTopikQuestionsIntoPages } from "@/lib/group-topik-pages";
import type { ExamMcqQuestion, ToeicSection, TopikSection } from "@/lib/types";

export type TopikQuestionMapItem = {
  questionId: string;
  questionNo: number;
  section: TopikSection | ToeicSection;
  answered: boolean;
  navigateTo: number;
  isCurrent: boolean;
};

export function findExamStepIndexForQuestion(
  questionId: string,
  steps: TopikExamStep[],
): number {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.kind === "mcq" && step.questions.some((q) => q.id === questionId)) {
      return i;
    }
    if (step.kind === "writing" && step.question.id === questionId) {
      return i;
    }
  }
  return 0;
}

export function questionIdsOnExamStep(
  step: TopikExamStep | undefined,
): string[] {
  if (!step) return [];
  if (step.kind === "mcq") return step.questions.map((q) => q.id);
  if (step.kind === "writing") return [step.question.id];
  return [];
}

export function buildExamQuestionMapItems(
  questions: ExamMcqQuestion[],
  steps: TopikExamStep[],
  stepIndex: number,
  mcqSelections: Record<string, number>,
  writingAnswers: WritingAnswerState,
): TopikQuestionMapItem[] {
  const currentIds = new Set(questionIdsOnExamStep(steps[stepIndex]));

  return questions.map((q) => {
    const answered = isWritingQuestion(q)
      ? isWritingAnswerComplete(q, writingAnswers)
      : mcqSelections[q.id] !== undefined;

    return {
      questionId: q.id,
      questionNo: q.questionNo,
      section: q.section,
      answered,
      navigateTo: findExamStepIndexForQuestion(q.id, steps),
      isCurrent: currentIds.has(q.id),
    };
  });
}

export function buildQuizQuestionMapItems(
  questions: ExamMcqQuestion[],
  pages: ExamMcqQuestion[][],
  pageIndex: number,
  selections: Record<string, number>,
): TopikQuestionMapItem[] {
  const pageByQuestionId = new Map<string, number>();
  pages.forEach((page, i) => {
    for (const q of page) {
      pageByQuestionId.set(q.id, i);
    }
  });

  const currentPage = pages[pageIndex] ?? [];
  const currentIds = new Set(currentPage.map((q) => q.id));

  return questions.map((q) => ({
    questionId: q.id,
    questionNo: q.questionNo,
    section: q.section,
    answered: selections[q.id] !== undefined,
    navigateTo: pageByQuestionId.get(q.id) ?? 0,
    isCurrent: currentIds.has(q.id),
  }));
}

export function buildWritingQuestionMapItems(
  questions: ExamMcqQuestion[],
  pageIndex: number,
  answers: WritingAnswerState,
): TopikQuestionMapItem[] {
  const current = questions[pageIndex];

  return questions.map((q, i) => ({
    questionId: q.id,
    questionNo: q.questionNo,
    section: q.section,
    answered: isWritingAnswerComplete(q, answers),
    navigateTo: i,
    isCurrent: current?.id === q.id,
  }));
}

export function groupMapItemsBySection(
  items: TopikQuestionMapItem[],
): { section: TopikSection | ToeicSection; items: TopikQuestionMapItem[] }[] {
  const groups: { section: TopikSection | ToeicSection; items: TopikQuestionMapItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) {
      last.items.push(item);
    } else {
      groups.push({ section: item.section, items: [item] });
    }
  }
  return groups;
}
