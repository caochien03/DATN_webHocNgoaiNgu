import { Injectable } from '@nestjs/common';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PathsService } from '../paths/paths.service';
import { toVnDayStart } from '../goals/vn-day';

@Injectable()
export class QuizAttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pathsService: PathsService,
  ) {}

  async list(userId: string, languageCode?: string) {
    return this.prisma.quizAttempt.findMany({
      where: {
        userId,
        ...(languageCode && { languageCode }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(userId: string, dto: CreateQuizAttemptDto) {
    const safeCorrectAnswers = Math.min(dto.correctAnswers, dto.totalQuestions);
    const now = new Date();
    const day = toVnDayStart(now);
    const lang = dto.languageCode ?? 'ko';
    const setting = await this.prisma.userGoalSetting.findUnique({
      where: { userId },
      select: { dailyCardTarget: true },
    });
    const goalTarget = setting?.dailyCardTarget ?? 20;
    const result = await this.prisma.$transaction(async (tx) => {
      const attempt = await tx.quizAttempt.create({
        data: {
          userId,
          sourceType: dto.sourceType,
          sourceId: dto.sourceId,
          sourceTitle: dto.sourceTitle,
          languageCode: lang,
          totalQuestions: dto.totalQuestions,
          correctAnswers: safeCorrectAnswers,
          scorePercent: dto.scorePercent,
        },
      });
      const progress = await tx.userDailyProgress.upsert({
        where: {
          userId_date_languageCode: {
            userId,
            date: day,
            languageCode: lang,
          },
        },
        update: {
          quizAttempts: { increment: 1 },
          goalTarget,
        },
        create: {
          userId,
          date: day,
          languageCode: lang,
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

    if (dto.sourceType === 'TOPIC' || dto.sourceType === 'LESSON') {
      void this.pathsService.autoCompleteStepIfExists(
        userId,
        dto.sourceType,
        dto.sourceId,
      );
    }

    return result;
  }
}
