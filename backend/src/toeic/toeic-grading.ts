import { BadRequestException } from '@nestjs/common';
import { ToeicQuestion, ToeicSection } from '@prisma/client';
import { ToeicAnswerItemDto } from './dto/submit-toeic.dto';

export type GradedToeicAnswer = {
  questionId: string;
  questionNo: number;
  section: ToeicSection;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string | null;
};

export function assertUniqueAnswers(answers: ToeicAnswerItemDto[]) {
  const ids = answers.map((a) => a.questionId);
  if (new Set(ids).size !== ids.length) {
    throw new BadRequestException('Duplicate questionId in answers');
  }
}

export function gradeToeicAnswers(
  questions: ToeicQuestion[],
  answers: ToeicAnswerItemDto[],
): { graded: GradedToeicAnswer[]; correctCount: number } {
  const byId = new Map(questions.map((q) => [q.id, q]));
  let correctCount = 0;

  const graded = answers.map((answer) => {
    const question = byId.get(answer.questionId);
    if (!question) {
      throw new BadRequestException(`Question not found: ${answer.questionId}`);
    }

    const selectedIndex = answer.selectedIndex;
    if (selectedIndex < 0 || selectedIndex >= question.options.length) {
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
      selectedIndex,
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
