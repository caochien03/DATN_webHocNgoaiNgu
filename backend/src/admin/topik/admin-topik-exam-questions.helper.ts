import { BadRequestException } from '@nestjs/common';
import { Prisma, TopikTier } from '@prisma/client';
import {
  assertValidQuestionNo,
  validateOptions,
} from '../../topik/topik-question-limits';
import { ExamQuestionInputDto } from './dto/exam-question-input.dto';

type Tx = Prisma.TransactionClient;

export function validateExamQuestions(
  tier: TopikTier,
  questions: ExamQuestionInputDto[],
) {
  if (questions.length === 0) {
    throw new BadRequestException('questions must not be empty');
  }

  const sortOrders = new Set<number>();
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const label = `questions[${i}]`;

    if (sortOrders.has(q.sortOrder)) {
      throw new BadRequestException(
        `${label}: duplicate sortOrder ${q.sortOrder}`,
      );
    }
    sortOrders.add(q.sortOrder);

    try {
      assertValidQuestionNo(tier, q.section, q.questionNo);
      validateOptions(q.correctIndex, q.options);
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw new BadRequestException(`${label}: ${err.message}`);
      }
      throw err;
    }
  }
}

export async function createQuestionsForExam(
  tx: Tx,
  examId: string,
  tier: TopikTier,
  questions: ExamQuestionInputDto[],
) {
  for (const q of questions) {
    const question = await tx.topikQuestion.create({
      data: {
        tier,
        section: q.section,
        questionNo: q.questionNo,
        prompt: q.prompt,
        passage: q.passage,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        audioUrl: q.audioUrl,
        bundleId: q.bundleId,
        points: q.points ?? 2,
        isPublished: true,
      },
    });

    await tx.topikExamQuestion.create({
      data: {
        examId,
        questionId: question.id,
        sortOrder: q.sortOrder,
      },
    });
  }
}

export async function replaceExamQuestions(
  tx: Tx,
  examId: string,
  tier: TopikTier,
  questions: ExamQuestionInputDto[],
) {
  const slots = await tx.topikExamQuestion.findMany({
    where: { examId },
    select: { questionId: true },
  });
  const oldQuestionIds = slots.map((s) => s.questionId);

  await tx.topikExamQuestion.deleteMany({ where: { examId } });

  if (oldQuestionIds.length > 0) {
    await tx.topikQuestion.deleteMany({
      where: { id: { in: oldQuestionIds } },
    });
  }

  await createQuestionsForExam(tx, examId, tier, questions);
}

export const examWithQuestionsInclude = {
  questions: {
    orderBy: { sortOrder: 'asc' as const },
    include: { question: true },
  },
} satisfies Prisma.TopikExamInclude;
