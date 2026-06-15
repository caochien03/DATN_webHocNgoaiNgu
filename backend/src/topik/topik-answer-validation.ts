import { BadRequestException } from '@nestjs/common';
import { TopikQuestion } from '@prisma/client';
import { TopikAnswerItemDto } from './dto/submit-topik.dto';
import { isWritingQuestionType } from './topik-question-validation';
import { getWritingPartCount } from './topik-writing-parts';

export function assertAnswersMatchQuestions(
  questions: TopikQuestion[],
  answers: TopikAnswerItemDto[],
) {
  const byId = new Map(questions.map((q) => [q.id, q]));

  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    if (!question) {
      throw new BadRequestException(
        `Question not found: ${answer.questionId}`,
      );
    }

    const hasMcq =
      answer.selectedIndex !== undefined && answer.selectedIndex !== null;
    const hasTextSingle =
      typeof answer.textAnswer === 'string' &&
      answer.textAnswer.trim().length > 0;
    const hasTextMulti =
      Array.isArray(answer.textAnswers) &&
      answer.textAnswers.length > 0 &&
      answer.textAnswers.every((t) => typeof t === 'string' && t.trim());

    if (isWritingQuestionType(question.questionType)) {
      const expected = getWritingPartCount(question);
      if (expected > 1) {
        if (!hasTextMulti || answer.textAnswers!.length !== expected) {
          throw new BadRequestException(
            `Câu ${answer.questionId}: cần ${expected} textAnswers (㉠, ㉡…)`,
          );
        }
        if (hasMcq || hasTextSingle) {
          throw new BadRequestException(
            `Câu ${answer.questionId}: dùng textAnswers[], không dùng selectedIndex/textAnswer`,
          );
        }
      } else if (!hasTextSingle) {
        throw new BadRequestException(
          `Câu ${answer.questionId}: cần textAnswer cho câu viết`,
        );
      } else if (hasMcq || hasTextMulti) {
        throw new BadRequestException(
          `Câu ${answer.questionId}: chỉ gửi textAnswer cho câu viết đơn`,
        );
      }
      continue;
    }

    if (!hasMcq || hasTextSingle || hasTextMulti) {
      throw new BadRequestException(
        `Câu ${answer.questionId}: cần selectedIndex cho trắc nghiệm`,
      );
    }
    if (
      answer.selectedIndex! < 0 ||
      answer.selectedIndex! >= question.options.length
    ) {
      throw new BadRequestException(
        `selectedIndex out of range for question ${answer.questionId}`,
      );
    }
  }
}
