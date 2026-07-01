import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsService } from '../goals/goals.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goalsService: GoalsService,
  ) {}

  async getForLanguage(userId: string, languageCode?: string) {
    const lang = languageCode || 'ko';
    const [
      goal,
      reviewDue,
      decks,
      paths,
      recentQuiz,
      recentExam,
      recentSpeaking,
    ] = await Promise.all([
      this.goalsService.getMe(userId, lang),
      this.getReviewDue(userId, lang),
      this.getDeckStats(userId, lang),
      this.getPathStats(userId, lang),
      this.getRecentQuiz(userId, lang),
      this.getRecentExam(userId, lang),
      this.getRecentSpeaking(userId, lang),
    ]);
    return {
      languageCode: lang,
      goal,
      reviewDue,
      decks,
      paths,
      recentQuiz,
      recentExam,
      recentSpeaking,
    };
  }

  private async getReviewDue(userId: string, languageCode: string) {
    const now = new Date();
    const dueCount = await this.prisma.card.count({
      where: {
        deck: {
          userId,
          sourceTopicId: null,
          languageCode,
        },
        OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }],
      },
    });
    return { dueCount };
  }

  private async getDeckStats(userId: string, languageCode: string) {
    const decks = await this.prisma.deck.findMany({
      where: {
        userId,
        sourceTopicId: null,
        languageCode,
      },
      select: {
        cards: { select: { lastResult: true } },
      },
    });
    let totalCards = 0;
    let learnedCards = 0;
    for (const deck of decks) {
      for (const card of deck.cards) {
        totalCards += 1;
        if (card.lastResult === true) learnedCards += 1;
      }
    }
    return {
      deckCount: decks.length,
      totalCards,
      learnedCards,
    };
  }

  private async getPathStats(userId: string, languageCode: string) {
    const paths = await this.prisma.learningPath.findMany({
      where: { languageCode },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        steps: { select: { id: true } },
        progress: {
          where: { userId },
          select: { completedStepIds: true },
          take: 1,
        },
      },
    });
    let started = 0;
    let percentSum = 0;
    let primaryPath: {
      id: string;
      title: string;
      percent: number;
      completedSteps: number;
      totalSteps: number;
    } | null = null;
    let bestPercent = -1;
    for (const path of paths) {
      const progress = path.progress[0] ?? null;
      const totalSteps = path.steps.length;
      const completedSteps = progress?.completedStepIds.length ?? 0;
      const percent =
        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      if (progress) {
        started += 1;
        percentSum += percent;
        if (percent > bestPercent) {
          bestPercent = percent;
          primaryPath = {
            id: path.id,
            title: path.title,
            percent,
            completedSteps,
            totalSteps,
          };
        }
      }
    }
    if (!primaryPath && paths[0]) {
      primaryPath = {
        id: paths[0].id,
        title: paths[0].title,
        percent: 0,
        completedSteps: 0,
        totalSteps: paths[0].steps.length,
      };
    }
    return {
      total: paths.length,
      started,
      avgPercent: started > 0 ? Math.round(percentSum / started) : 0,
      primaryPath,
    };
  }

  private async getRecentQuiz(userId: string, languageCode: string) {
    const row = await this.prisma.quizAttempt.findFirst({
      where: { userId, languageCode },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sourceType: true,
        sourceTitle: true,
        scorePercent: true,
        correctAnswers: true,
        totalQuestions: true,
        createdAt: true,
      },
    });
    return row;
  }

  private async getRecentExam(userId: string, languageCode: string) {
    if (languageCode === 'en') {
      const row = await this.prisma.toeicExamAttempt.findFirst({
        where: { userId, finishedAt: { not: null } },
        orderBy: { finishedAt: 'desc' },
        select: {
          id: true,
          mode: true,
          scorePercent: true,
          correctCount: true,
          totalQuestions: true,
          finishedAt: true,
        },
      });
      return row ? { kind: 'toeic' as const, ...row } : null;
    }
    if (languageCode === 'ko') {
      const row = await this.prisma.topikExamAttempt.findFirst({
        where: { userId, finishedAt: { not: null } },
        orderBy: { finishedAt: 'desc' },
        select: {
          id: true,
          mode: true,
          tier: true,
          scorePercent: true,
          correctCount: true,
          totalQuestions: true,
          finishedAt: true,
        },
      });
      return row ? { kind: 'topik' as const, ...row } : null;
    }
    return null;
  }

  private async getRecentSpeaking(userId: string, languageCode: string) {
    const row = await this.prisma.speakingSession.findFirst({
      where: {
        userId,
        languageCode,
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        overallScore: true,
        goalsCompleted: true,
        goalsTotal: true,
        completedAt: true,
        situation: { select: { title: true } },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      situationTitle: row.situation.title,
      overallScore: row.overallScore,
      goalsCompleted: row.goalsCompleted,
      goalsTotal: row.goalsTotal,
      completedAt: row.completedAt,
    };
  }
}
