import { BadRequestException } from '@nestjs/common';
import { TopikQuestion, TopikSection } from '@prisma/client';
import { TopikAnswerItemDto } from './dto/submit-topik.dto';

export type GradedTopikAnswer = {
  questionId: string;
  questionNo: number;
  section: TopikSection;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string | null;
};

export function assertUniqueAnswers(answers: TopikAnswerItemDto[]) {
  const ids = answers.map((a) => a.questionId);
  if (new Set(ids).size !== ids.length) {
    throw new BadRequestException('Duplicate questionId in answers');
  }
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
    if (
      answer.selectedIndex < 0 ||
      answer.selectedIndex >= question.options.length
    ) {
      throw new BadRequestException(
        `selectedIndex out of range for question ${answer.questionId}`,
      );
    }
    const isCorrect = answer.selectedIndex === question.correctIndex;
    if (isCorrect) correctCount += 1;
    return {
      questionId: question.id,
      questionNo: question.questionNo,
      section: question.section,
      selectedIndex: answer.selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      explanation: question.explanation,
    };
  });

  return { graded, correctCount };
}

export function scorePercent(correct: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}
