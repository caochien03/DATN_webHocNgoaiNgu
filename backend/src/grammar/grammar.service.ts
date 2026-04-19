import { Injectable, NotFoundException } from '@nestjs/common';
import { GrammarLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const VALID_LEVELS = new Set<string>([
  'BEGINNER_1',
  'BEGINNER_2',
  'INTERMEDIATE_1',
  'INTERMEDIATE_2',
  'ADVANCED_1',
  'ADVANCED_2',
]);

@Injectable()
export class GrammarService {
  constructor(private readonly prisma: PrismaService) {}

  async listLessons(level?: string) {
    const where: Prisma.GrammarLessonWhereInput = {};
    if (level && VALID_LEVELS.has(level)) {
      where.level = level as GrammarLevel;
    }
    return this.prisma.grammarLesson.findMany({
      where,
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { _count: { select: { points: true } } },
    });
  }

  async getLesson(id: string) {
    const lesson = await this.prisma.grammarLesson.findUnique({
      where: { id },
      include: {
        points: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }
}
