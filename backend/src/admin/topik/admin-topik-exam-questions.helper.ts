import { BadRequestException } from '@nestjs/common';
import {
  Prisma,
  TopikQuestionType,
  TopikSection,
  TopikTier,
} from '@prisma/client';
import {
  assertValidQuestionNo,
} from '../../topik/topik-question-limits';
import { assertQuestionInput } from '../../topik/topik-question-validation';
import { parseWritingParts } from '../../topik/topik-writing-parts';
import { ExamQuestionInputDto } from './dto/exam-question-input.dto';

type Tx = Prisma.TransactionClient;

export function resolveQuestionType(
  section: TopikSection,
  questionType?: TopikQuestionType,
): TopikQuestionType {
  if (questionType) return questionType;
  if (section === TopikSection.WRITING) {
    return TopikQuestionType.SHORT_ANSWER;
  }
  return TopikQuestionType.MULTIPLE_CHOICE;
}

export function normalizeQuestionFields(
  tier: TopikTier,
  q: ExamQuestionInputDto,
) {
  const questionType = resolveQuestionType(q.section, q.questionType);
  const options = q.options ?? [];
  const correctIndex = q.correctIndex ?? 0;

  assertQuestionInput({
    tier,
    section: q.section,
    questionType,
    options,
    correctIndex,
    minChars: q.minChars,
    maxChars: q.maxChars,
    writingParts: q.writingParts,
  });

  const writingParts =
    questionType === TopikQuestionType.SHORT_ANSWER && q.writingParts?.length
      ? parseWritingParts(q.writingParts)
      : null;

  return { questionType, options, correctIndex, writingParts };
}

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
      const questionType = resolveQuestionType(q.section, q.questionType);
      const options = q.options ?? [];
      const correctIndex = q.correctIndex ?? 0;
      assertQuestionInput({
        tier,
        section: q.section,
        questionType,
        options,
        correctIndex,
        minChars: q.minChars,
        maxChars: q.maxChars,
        writingParts: q.writingParts,
      });
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
    const { questionType, options, correctIndex, writingParts } =
      normalizeQuestionFields(tier, q);

    const question = await tx.topikQuestion.create({
      data: {
        tier,
        section: q.section,
        questionNo: q.questionNo,
        questionType,
        prompt: q.prompt,
        passage: q.passage,
        options,
        correctIndex,
        explanation: q.explanation,
        audioUrl: q.audioUrl,
        imageUrl: q.imageUrl,
        optionImageUrls: q.optionImageUrls ?? [],
        bundleId: q.bundleId,
        modelAnswer: q.modelAnswer,
        ...(writingParts && {
          writingParts: writingParts as Prisma.InputJsonValue,
        }),
        minChars: q.minChars,
        maxChars: q.maxChars,
        maxScore: q.maxScore,
        ...(q.rubric !== undefined && { rubric: q.rubric as Prisma.InputJsonValue }),
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
