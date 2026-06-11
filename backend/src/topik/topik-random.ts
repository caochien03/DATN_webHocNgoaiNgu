import { BadRequestException } from '@nestjs/common';
import { TopikSection, TopikTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const questionForClient = {
  id: true,
  tier: true,
  section: true,
  questionNo: true,
  prompt: true,
  passage: true,
  options: true,
  audioUrl: true,
  points: true,
} as const;

type ClientQuestion = {
  id: string;
  tier: TopikTier;
  section: TopikSection;
  questionNo: number;
  prompt: string;
  passage: string | null;
  options: string[];
  audioUrl: string | null;
  points: number;
};

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Luyện dạng: random `count` câu khác nhau từ ngân hàng trong khoảng (không trùng questionId). */
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
    where: {
      tier: params.tier,
      section: params.section,
      questionNo: { gte: params.fromNo, lte: params.toNo },
      isPublished: true,
    },
    select: questionForClient,
  });
  if (pool.length === 0) {
    throw new BadRequestException(
      'Chưa có câu hỏi trong ngân hàng cho dạng bài này',
    );
  }
  const take = Math.min(params.count, pool.length);
  const questions = shuffle(pool).slice(0, take);
  return { questions, requestedCount: params.count };
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
  return slots.map((slot) => slot.question);
}

export async function loadQuestionsByIds(
  prisma: PrismaService,
  questionIds: string[],
): Promise<ClientQuestion[]> {
  const rows = await prisma.topikQuestion.findMany({
    where: { id: { in: questionIds }, isPublished: true },
    select: questionForClient,
  });
  const byId = new Map(rows.map((q) => [q.id, q]));
  return questionIds
    .map((id) => byId.get(id))
    .filter((q): q is ClientQuestion => q !== undefined);
}

export { questionForClient };
