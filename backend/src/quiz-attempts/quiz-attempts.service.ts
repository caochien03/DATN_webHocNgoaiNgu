import { Injectable } from '@nestjs/common';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizAttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  private static toVnDayStart(date: Date) {
    const tzOffsetMs = 7 * 60 * 60 * 1000;
    const vn = new Date(date.getTime() + tzOffsetMs);
    return new Date(
      Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()) - tzOffsetMs,
    );
  }

  async list(userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(userId: string, dto: CreateQuizAttemptDto) {
    const safeCorrectAnswers = Math.min(dto.correctAnswers, dto.totalQuestions);
    const now = new Date();
    const day = QuizAttemptsService.toVnDayStart(now);
    const setting = await this.prisma.userGoalSetting.findUnique({
      where: { userId },
      select: { dailyCardTarget: true },
    });
    const goalTarget = setting?.dailyCardTarget ?? 20;
    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.quizAttempt.create({
        data: {
          userId,
          sourceType: dto.sourceType,
          sourceId: dto.sourceId,
          sourceTitle: dto.sourceTitle,
          totalQuestions: dto.totalQuestions,
          correctAnswers: safeCorrectAnswers,
          scorePercent: dto.scorePercent,
        },
      });
      const progress = await tx.userDailyProgress.upsert({
        where: { userId_date: { userId, date: day } },
        update: {
          quizAttempts: { increment: 1 },
          goalTarget,
        },
        create: {
          userId,
          date: day,
          quizAttempts: 1,
          goalTarget,
          goalAchieved: false,
        },
      });
      if (!progress.goalAchieved && progress.reviewedCards >= goalTarget) {
        await tx.userDailyProgress.update({
          where: { id: progress.id },
          data: { goalAchieved: true },
        });
      }
      return attempt;
    });
  }
}
