import { BadRequestException } from '@nestjs/common';
import { Prisma, ToeicTier } from '@prisma/client';
import { assertValidQuestionNo } from '../../toeic/toeic-question-limits';
import { assertQuestionInput } from '../../toeic/toeic-question-validation';
import { ToeicExamQuestionInputDto } from './dto/exam-question-input.dto';

type Tx = Prisma.TransactionClient;

export function normalizeQuestionFields(q: ToeicExamQuestionInputDto) {
  const options = q.options ?? [];
  const correctIndex = q.correctIndex ?? 0;
  assertQuestionInput({ options, correctIndex });
  return { options, correctIndex };
}

export function validateExamQuestions(
  tier: ToeicTier,
  questions: ToeicExamQuestionInputDto[],
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
      normalizeQuestionFields(q);
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
  tier: ToeicTier,
  questions: ToeicExamQuestionInputDto[],
) {
  for (const q of questions) {
    const { options, correctIndex } = normalizeQuestionFields(q);

    const question = await tx.toeicQuestion.create({
      data: {
        tier,
        section: q.section,
        questionNo: q.questionNo,
        prompt: q.prompt,
        passage: q.passage,
        options,
        correctIndex,
        explanation: q.explanation,
        audioUrl: q.audioUrl,
        imageUrl: q.imageUrl,
        optionImageUrls: q.optionImageUrls ?? [],
        bundleId: q.bundleId,
        points: q.points ?? 1,
        isPublished: true,
      },
    });

    await tx.toeicExamQuestion.create({
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
  tier: ToeicTier,
  questions: ToeicExamQuestionInputDto[],
) {
  const slots = await tx.toeicExamQuestion.findMany({
    where: { examId },
    select: { questionId: true },
  });
  const oldQuestionIds = slots.map((s) => s.questionId);

  await tx.toeicExamQuestion.deleteMany({ where: { examId } });

  if (oldQuestionIds.length > 0) {
    await tx.toeicQuestion.deleteMany({
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
} satisfies Prisma.ToeicExamInclude;
