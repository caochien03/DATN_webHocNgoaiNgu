import { BadRequestException } from '@nestjs/common';
import {
  TopikQuestion,
  TopikQuestionType,
  TopikSection,
} from '@prisma/client';
import { TopikAnswerItemDto } from './dto/submit-topik.dto';
import { isWritingQuestionType } from './topik-question-validation';
import {
  getWritingPartCount,
  parseWritingParts,
  type TopikWritingPart,
} from './topik-writing-parts';

export type WritingGradeStatus = 'pending' | 'ai_graded' | 'not_applicable';

export type GradedWritingPartResult = {
  label: string;
  textAnswer: string;
  modelAnswer?: string | null;
  maxScore?: number | null;
  aiScore?: number | null;
  aiFeedback?: string | null;
};

export type GradedTopikAnswer = {
  questionId: string;
  questionNo: number;
  section: TopikSection;
  questionType: TopikQuestionType;
  selectedIndex?: number;
  correctIndex?: number;
  textAnswer?: string;
  textAnswers?: string[];
  writingPartResults?: GradedWritingPartResult[];
  isCorrect: boolean | null;
  gradeStatus: WritingGradeStatus | 'graded';
  explanation: string | null;
  modelAnswer?: string | null;
  maxScore?: number | null;
  /// Điểm AI cho câu viết (tổng cả câu, gồm các ý nhỏ nếu có).
  aiScore?: number | null;
  /// Nhận xét chung của AI cho câu viết.
  aiFeedback?: string | null;
};

export function assertUniqueAnswers(answers: TopikAnswerItemDto[]) {
  const ids = answers.map((a) => a.questionId);
  if (new Set(ids).size !== ids.length) {
    throw new BadRequestException('Duplicate questionId in answers');
  }
}

function gradeWritingAnswer(
  question: TopikQuestion,
  answer: TopikAnswerItemDto,
): GradedTopikAnswer {
  const partCount = getWritingPartCount(question);
  const parts = parseWritingParts(question.writingParts);

  if (partCount > 1 && parts) {
    const textAnswers = answer.textAnswers!.map((t) => t.trim());
    const writingPartResults: GradedWritingPartResult[] = parts.map(
      (part, i) => ({
        label: part.label,
        textAnswer: textAnswers[i] ?? '',
        modelAnswer: part.modelAnswer ?? null,
        maxScore: part.maxScore ?? null,
      }),
    );
    return {
      questionId: question.id,
      questionNo: question.questionNo,
      section: question.section,
      questionType: question.questionType,
      textAnswers,
      writingPartResults,
      isCorrect: null,
      gradeStatus: 'pending',
      explanation: question.explanation,
      maxScore: question.maxScore,
    };
  }

  const textAnswer = answer.textAnswer?.trim() ?? '';
  return {
    questionId: question.id,
    questionNo: question.questionNo,
    section: question.section,
    questionType: question.questionType,
    textAnswer,
    isCorrect: null,
    gradeStatus: 'pending',
    explanation: question.explanation,
    modelAnswer: question.modelAnswer,
    maxScore: question.maxScore,
  };
}

export function gradeTopikAnswers(
  questions: TopikQuestion[],
  answers: TopikAnswerItemDto[],
): { graded: GradedTopikAnswer[]; correctCount: number } {
  const byId = new Map(questions.map((q) => [q.id, q]));
  let correctCount = 0;

  const graded = answers.map((answer) => {
    const question = byId.get(answer.questionId);
    if (!question) {
      throw new BadRequestException(
        `Question not found: ${answer.questionId}`,
      );
    }

    if (isWritingQuestionType(question.questionType)) {
      return gradeWritingAnswer(question, answer);
    }

    const selectedIndex = answer.selectedIndex!;
    if (
      selectedIndex < 0 ||
      selectedIndex >= question.options.length
    ) {
      throw new BadRequestException(
        `selectedIndex out of range for question ${answer.questionId}`,
      );
    }
    const isCorrect = selectedIndex === question.correctIndex;
    if (isCorrect) correctCount += 1;
    return {
      questionId: question.id,
      questionNo: question.questionNo,
      section: question.section,
      questionType: question.questionType,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      gradeStatus: 'graded' as const,
      explanation: question.explanation,
    };
  });

  return { graded, correctCount };
}

export function scorePercent(correct: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

/** Chỉ tính % trên câu trắc nghiệm đã chấm (viết chưa tính). */
export function scorePercentMcqOnly(
  graded: GradedTopikAnswer[],
): { correctCount: number; totalMcq: number; scorePercent: number } {
  const mcq = graded.filter(
    (a) => a.questionType === TopikQuestionType.MULTIPLE_CHOICE,
  );
  const correctCount = mcq.filter((a) => a.isCorrect).length;
  const totalMcq = mcq.length;
  return {
    correctCount,
    totalMcq,
    scorePercent: scorePercent(correctCount, totalMcq),
  };
}
