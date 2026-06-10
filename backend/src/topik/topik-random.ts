import { BadRequestException } from '@nestjs/common';
import { TopikSection, TopikTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TOPIK_EXAM_BLUEPRINT } from './topik-exam-blueprint';

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

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

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

export async function randomQuestionsForRange(
  prisma: PrismaService,
  params: {
    tier: TopikTier;
    section: TopikSection;
    fromNo: number;
    toNo: number;
  },
): Promise<{ questions: ClientQuestion[]; missingSlots: number[] }> {
  const questions: ClientQuestion[] = [];
  const missingSlots: number[] = [];

  for (let questionNo = params.fromNo; questionNo <= params.toNo; questionNo++) {
    const pool = await prisma.topikQuestion.findMany({
      where: {
        tier: params.tier,
        section: params.section,
        questionNo,
        isPublished: true,
      },
      select: questionForClient,
    });
    const picked = pickRandom(pool);
    if (!picked) {
      missingSlots.push(questionNo);
    } else {
      questions.push(picked);
    }
  }

  return { questions, missingSlots };
}

export async function randomQuestionsForExam(
  prisma: PrismaService,
  tier: TopikTier,
): Promise<{ questions: ClientQuestion[]; missingSlots: number[] }> {
  const blueprint = TOPIK_EXAM_BLUEPRINT[tier];
  const questions: ClientQuestion[] = [];
  const missingSlots: number[] = [];

  for (const range of blueprint) {
    const result = await randomQuestionsForRange(prisma, {
      tier,
      section: range.section,
      fromNo: range.fromNo,
      toNo: range.toNo,
    });
    questions.push(...result.questions);
    missingSlots.push(...result.missingSlots);
  }

  return { questions, missingSlots };
}

export function assertNoMissingSlots(
  missingSlots: number[],
  context: string,
) {
  if (missingSlots.length === 0) return;
  const preview = missingSlots.slice(0, 8).join(', ');
  const suffix =
    missingSlots.length > 8 ? ` … (+${missingSlots.length - 8})` : '';
  throw new BadRequestException(
    `${context}: thiếu câu hỏi cho số câu ${preview}${suffix}. Admin cần bổ sung ngân hàng.`,
  );
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
