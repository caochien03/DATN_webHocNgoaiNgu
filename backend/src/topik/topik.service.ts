import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class TopikService {
  constructor(private readonly prisma: PrismaService) {}

  listFormats(tier: TopikTier, section?: TopikSection) {
    return this.prisma.topikQuestionFormat.findMany({
      where: {
        tier,
        ...(section && { section }),
      },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  listExams(tier?: TopikTier) {
    return this.prisma.topikExam.findMany({
      where: {
        isPublished: true,
        ...(tier && { tier }),
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  async getExamForTake(examId: string) {
    const exam = await this.prisma.topikExam.findFirst({
      where: { id: examId, isPublished: true },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            question: { select: questionForClient },
          },
        },
      },
    });
    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');
    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      tier: exam.tier,
      durationMinutes: exam.durationMinutes,
      questionCount: exam.questions.length,
      questions: exam.questions.map((slot) => slot.question),
    };
  }

  async getPracticeQuestions(params: {
    tier: TopikTier;
    section: TopikSection;
    fromNo: number;
    toNo: number;
    limit?: number;
  }) {
    const limit = Math.min(params.limit ?? 10, 30);
    const questions = await this.prisma.topikQuestion.findMany({
      where: {
        tier: params.tier,
        section: params.section,
        questionNo: { gte: params.fromNo, lte: params.toNo },
        isPublished: true,
      },
      select: questionForClient,
      take: limit,
      orderBy: [{ questionNo: 'asc' }, { createdAt: 'asc' }],
    });
    return questions;
  }

  async getFormatOrThrow(
    tier: TopikTier,
    section: TopikSection,
    fromNo: number,
    toNo: number,
  ) {
    const format = await this.prisma.topikQuestionFormat.findFirst({
      where: { tier, section, fromNo, toNo },
    });
    if (!format) {
      throw new NotFoundException('Không tìm thấy dạng bài');
    }
    return format;
  }
}
