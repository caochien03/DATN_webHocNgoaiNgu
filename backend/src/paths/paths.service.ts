import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PATH_LIST_COUNTS_INCLUDE,
  PATH_LIST_ORDER,
  pathAdminDetailInclude,
} from './path-queries';

@Injectable()
export class PathsService {
  private readonly logger = new Logger(PathsService.name);

  constructor(private readonly prisma: PrismaService) {}

  listCatalog() {
    return this.prisma.learningPath.findMany({
      orderBy: PATH_LIST_ORDER,
      include: PATH_LIST_COUNTS_INCLUDE,
    });
  }

  async getForAdmin(pathId: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      include: pathAdminDetailInclude,
    });
    if (!path) {
      throw new NotFoundException('Learning path not found');
    }
    return path;
  }

  async list(userId: string, languageCode?: string) {
    const paths = await this.prisma.learningPath.findMany({
      where: languageCode ? { languageCode } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        steps: { select: { id: true } },
        progress: {
          where: { userId },
          select: { completedStepIds: true, startedAt: true, updatedAt: true },
          take: 1,
        },
      },
    });

    return paths.map((path) => {
      const progress = path.progress[0] ?? null;
      const totalSteps = path.steps.length;
      const completedSteps = progress?.completedStepIds.length ?? 0;
      return {
        id: path.id,
        title: path.title,
        description: path.description,
        languageCode: path.languageCode,
        level: path.level,
        totalSteps,
        completedSteps,
        started: Boolean(progress),
        percent:
          totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      };
    });
  }

  async get(pathId: string, userId: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      include: {
        steps: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            topic: {
              select: {
                id: true,
                title: true,
                _count: { select: { words: true } },
              },
            },
            lesson: {
              select: {
                id: true,
                title: true,
                _count: {
                  select: { vocabulary: true, points: true, exercises: true },
                },
              },
            },
          },
        },
        progress: {
          where: { userId },
          take: 1,
        },
      },
    });
    if (!path) {
      throw new NotFoundException('Learning path not found');
    }
    const progress = path.progress[0] ?? null;
    const completed = new Set(progress?.completedStepIds ?? []);
    return {
      id: path.id,
      title: path.title,
      description: path.description,
      languageCode: path.languageCode,
      level: path.level,
      progress: progress
        ? {
            completedStepIds: progress.completedStepIds,
            startedAt: progress.startedAt,
            updatedAt: progress.updatedAt,
          }
        : null,
      steps: path.steps.map((step) => ({
        id: step.id,
        type: step.type,
        title: step.title,
        summary: step.summary,
        sortOrder: step.sortOrder,
        topicId: step.topicId,
        lessonId: step.lessonId,
        topic: step.topic,
        lesson: step.lesson,
        completed: completed.has(step.id),
      })),
    };
  }

  async start(pathId: string, userId: string) {
    await this.ensurePath(pathId);
    return this.prisma.userPathProgress.upsert({
      where: { userId_pathId: { userId, pathId } },
      update: {},
      create: { userId, pathId },
    });
  }

  async completeStep(pathId: string, stepId: string, userId: string) {
    const step = await this.prisma.learningPathStep.findFirst({
      where: { id: stepId, pathId },
      select: { id: true },
    });
    if (!step) {
      throw new NotFoundException('Learning path step not found');
    }
    const progress = await this.prisma.userPathProgress.upsert({
      where: { userId_pathId: { userId, pathId } },
      update: {},
      create: { userId, pathId },
    });
    const completed = progress.completedStepIds.includes(stepId)
      ? progress.completedStepIds
      : [...progress.completedStepIds, stepId];

    return this.prisma.userPathProgress.update({
      where: { id: progress.id },
      data: { completedStepIds: completed },
    });
  }

  async evaluateSourceRequirements(
    userId: string,
    sourceType: string,
    sourceId: string,
  ): Promise<{
    vocabRequired: boolean;
    vocabPassed: boolean;
    vocabBestScore: number | null;
    grammarRequired: boolean;
    grammarPassed: boolean;
    grammarBestScore: number | null;
    allPassed: boolean;
  }> {
    if (sourceType === 'TOPIC') {
      const topic = await this.prisma.vocabularyTopic.findUnique({
        where: { id: sourceId },
        select: { id: true, words: true },
      });
      const vocabRequired = (topic?.words?.length ?? 0) > 0;
      const attempts = await this.prisma.quizAttempt.findMany({
        where: {
          userId,
          sourceType: 'TOPIC',
          sourceId,
        },
        select: { scorePercent: true },
        orderBy: { scorePercent: 'desc' },
      });
      const vocabBestScore =
        attempts.length > 0 ? attempts[0].scorePercent : null;
      const vocabPassed =
        !vocabRequired || (vocabBestScore !== null && vocabBestScore >= 80);

      return {
        vocabRequired,
        vocabPassed,
        vocabBestScore,
        grammarRequired: false,
        grammarPassed: true,
        grammarBestScore: null,
        allPassed: vocabPassed,
      };
    }

    if (sourceType === 'LESSON') {
      const lesson = await this.prisma.grammarLesson.findUnique({
        where: { id: sourceId },
        select: { id: true, vocabulary: true, exercises: true },
      });
      const vocabRequired = (lesson?.vocabulary?.length ?? 0) > 0;
      const grammarRequired = (lesson?.exercises?.length ?? 0) > 0;

      const attempts = await this.prisma.quizAttempt.findMany({
        where: {
          userId,
          sourceType: 'LESSON',
          sourceId,
        },
        select: { sourceTitle: true, scorePercent: true },
      });

      const vocabAttempts = attempts.filter(
        (a) =>
          a.sourceTitle.toLowerCase().includes('từ vựng') ||
          a.sourceTitle.toLowerCase().includes('vocab') ||
          a.sourceTitle.toLowerCase().includes('write') ||
          a.sourceTitle.toLowerCase().includes('viết'),
      );
      const grammarAttempts = attempts.filter(
        (a) =>
          a.sourceTitle.toLowerCase().includes('ngữ pháp') ||
          a.sourceTitle.toLowerCase().includes('grammar') ||
          a.sourceTitle.toLowerCase().includes('practice') ||
          a.sourceTitle.toLowerCase().includes('luyện tập'),
      );

      const vocabBestScore =
        vocabAttempts.length > 0
          ? Math.max(...vocabAttempts.map((a) => a.scorePercent))
          : null;
      const grammarBestScore =
        grammarAttempts.length > 0
          ? Math.max(...grammarAttempts.map((a) => a.scorePercent))
          : null;

      const vocabPassed =
        !vocabRequired || (vocabBestScore !== null && vocabBestScore >= 80);
      const grammarPassed =
        !grammarRequired ||
        (grammarBestScore !== null && grammarBestScore >= 80);

      return {
        vocabRequired,
        vocabPassed,
        vocabBestScore,
        grammarRequired,
        grammarPassed,
        grammarBestScore,
        allPassed: vocabPassed && grammarPassed,
      };
    }

    return {
      vocabRequired: false,
      vocabPassed: true,
      vocabBestScore: null,
      grammarRequired: false,
      grammarPassed: true,
      grammarBestScore: null,
      allPassed: true,
    };
  }

  async autoCompleteStepIfExists(
    userId: string,
    sourceType: string,
    sourceId: string,
  ): Promise<string[]> {
    try {
      if (sourceType !== 'TOPIC' && sourceType !== 'LESSON') {
        return [];
      }

      // Kiểm tra xem người học đã đạt đủ điểm sàn 80% cho từng phần bắt buộc chưa
      const evaluation = await this.evaluateSourceRequirements(
        userId,
        sourceType,
        sourceId,
      );

      if (!evaluation.allPassed) {
        this.logger.log(
          `User ${userId} chưa đạt đủ điều kiện hoàn thành cho ${sourceType} ${sourceId} (allPassed: false)`,
        );
        return [];
      }

      const field = sourceType === 'TOPIC' ? 'topicId' : 'lessonId';

      const steps = await this.prisma.learningPathStep.findMany({
        where: {
          [field]: sourceId,
          path: {
            progress: {
              some: { userId },
            },
          },
        },
        select: { id: true, pathId: true },
      });

      const completedIds: string[] = [];
      for (const step of steps) {
        await this.completeStep(step.pathId, step.id, userId);
        completedIds.push(step.id);
      }
      if (completedIds.length > 0) {
        this.logger.log(
          `Đã tự động hoàn thành ${completedIds.length} bước lộ trình cho user ${userId} (source: ${sourceType} ${sourceId})`,
        );
      }
      return completedIds;
    } catch (e) {
      this.logger.warn(
        `autoCompleteStepIfExists thất bại: ${e instanceof Error ? e.message : String(e)}`,
      );
      return [];
    }
  }

  async getSourcePathStatus(
    userId: string,
    sourceType: string,
    sourceId: string,
  ) {
    const evaluation = await this.evaluateSourceRequirements(
      userId,
      sourceType,
      sourceId,
    );

    if (sourceType !== 'TOPIC' && sourceType !== 'LESSON') {
      return {
        inPath: false,
        completed: false,
        requirements: evaluation,
        steps: [],
      };
    }
    const field = sourceType === 'TOPIC' ? 'topicId' : 'lessonId';
    const steps = await this.prisma.learningPathStep.findMany({
      where: {
        [field]: sourceId,
        path: {
          progress: {
            some: { userId },
          },
        },
      },
      include: {
        path: {
          include: {
            progress: {
              where: { userId },
              select: { completedStepIds: true },
            },
          },
        },
      },
    });

    if (steps.length === 0) {
      return {
        inPath: false,
        completed: false,
        requirements: evaluation,
        steps: [],
      };
    }

    const stepStatuses = steps.map((s) => {
      const completedIds = s.path.progress[0]?.completedStepIds ?? [];
      const isCompleted = completedIds.includes(s.id);
      return {
        stepId: s.id,
        pathId: s.pathId,
        pathTitle: s.path.title,
        completed: isCompleted,
      };
    });

    const allCompleted = stepStatuses.every((s) => s.completed);

    return {
      inPath: true,
      completed: allCompleted,
      requirements: evaluation,
      steps: stepStatuses,
    };
  }

  private async ensurePath(pathId: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      select: { id: true },
    });
    if (!path) {
      throw new NotFoundException('Learning path not found');
    }
  }
}
