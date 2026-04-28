import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PathsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const paths = await this.prisma.learningPath.findMany({
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
            topic: { select: { id: true, title: true, _count: { select: { words: true } } } },
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
