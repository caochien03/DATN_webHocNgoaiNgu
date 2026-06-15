import { BadRequestException } from '@nestjs/common';
import { Prisma, TopikQuestionType, TopikSection, TopikTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { partitionPoolIntoUnits } from './topik-question-bundles';
import {
  type TopikWritingPartPublic,
  writingPartsForClient,
} from './topik-writing-parts';

/** Câu thuộc ít nhất một đề TOPIK đã công bố (pool luyện dạng). */
export function practicePoolQuestionWhere(params: {
  tier: TopikTier;
  section: TopikSection;
  fromNo: number;
  toNo: number;
  questionIds?: string[];
}): Prisma.TopikQuestionWhereInput {
  return {
    ...(params.questionIds && { id: { in: params.questionIds } }),
    tier: params.tier,
    section: params.section,
    questionNo: { gte: params.fromNo, lte: params.toNo },
    examSlots: {
      some: { exam: { isPublished: true } },
    },
  };
}

const questionForClient = {
  id: true,
  tier: true,
  section: true,
  questionNo: true,
  questionType: true,
  prompt: true,
  passage: true,
  options: true,
  audioUrl: true,
  imageUrl: true,
  optionImageUrls: true,
  bundleId: true,
  minChars: true,
  maxChars: true,
  maxScore: true,
  writingParts: true,
  points: true,
} as const;

type DbClientQuestion = Prisma.TopikQuestionGetPayload<{
  select: typeof questionForClient;
}>;

type ClientQuestion = {
  id: string;
  tier: TopikTier;
  section: TopikSection;
  questionNo: number;
  questionType: TopikQuestionType;
  prompt: string;
  passage: string | null;
  options: string[];
  audioUrl: string | null;
  imageUrl: string | null;
  optionImageUrls: string[];
  bundleId: string | null;
  minChars: number | null;
  maxChars: number | null;
  maxScore: number | null;
  writingParts: TopikWritingPartPublic[] | null;
  points: number;
};

function toClientQuestion(q: DbClientQuestion): ClientQuestion {
  const { writingParts, ...rest } = q;
  return {
    ...rest,
    writingParts: writingPartsForClient(writingParts),
  };
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Luyện dạng: random `count` câu khác nhau từ đề đã công bố (không trùng questionId). */
export async function randomQuestionsForPractice(
  prisma: PrismaService,
  params: {
    tier: TopikTier;
    section: TopikSection;
    fromNo: number;
    toNo: number;
    count: number;
  },
): Promise<{ questions: ClientQuestion[]; requestedCount: number }> {
  const pool = await prisma.topikQuestion.findMany({
    where: practicePoolQuestionWhere(params),
    select: questionForClient,
  });
  if (pool.length === 0) {
    throw new BadRequestException(
      'Chưa có câu hỏi trong đề đã công bố cho dạng bài này',
    );
  }
  const clientPool = pool.map(toClientQuestion);
  const units = partitionPoolIntoUnits(clientPool);
  const shuffled = shuffle(units);
  const selected: ClientQuestion[] = [];
  for (const unit of shuffled) {
    if (selected.length >= params.count) break;
    if (selected.length + unit.length <= params.count) {
      selected.push(...unit);
    }
  }
  if (selected.length === 0) {
    throw new BadRequestException(
      'Không ghép được số câu yêu cầu với pool hiện có (có thể do cặp bundle) — hãy tăng số câu hoặc thêm câu đơn',
    );
  }
  return { questions: selected, requestedCount: params.count };
}

/** Thi thử: câu cố định theo sortOrder trong đề (không random). */
export async function loadFixedExamQuestions(
  prisma: PrismaService,
  examId: string,
): Promise<ClientQuestion[]> {
  const slots = await prisma.topikExamQuestion.findMany({
    where: { examId },
    orderBy: { sortOrder: 'asc' },
    include: {
      question: { select: questionForClient },
    },
  });
  return slots.map((slot) => toClientQuestion(slot.question));
}

