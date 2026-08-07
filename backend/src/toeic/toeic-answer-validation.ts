import { BadRequestException } from '@nestjs/common';
import { ToeicQuestion } from '@prisma/client';
import { ToeicAnswerItemDto } from './dto/submit-toeic.dto';

export function assertAnswersMatchQuestions(
  questions: ToeicQuestion[],
  answers: ToeicAnswerItemDto[],
) {
  const byId = new Map(questions.map((q) => [q.id, q]));

  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    if (!question) {
      throw new BadRequestException(`Question not found: ${answer.questionId}`);
    }

    if (answer.selectedIndex === undefined || answer.selectedIndex === null) {
      throw new BadRequestException(
        `Câu ${answer.questionId}: cần selectedIndex`,
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
  }
}
