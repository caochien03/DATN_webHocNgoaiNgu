import { Injectable, NotFoundException } from '@nestjs/common';
import { GrammarLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  EXERCISE_LIST_ORDER,
  LESSON_LIST_COUNTS_INCLUDE,
  LESSON_LIST_ORDER,
  lessonDetailInclude,
} from './lesson-queries';

const VALID_LEVELS = new Set<string>([
  'BEGINNER_1',
  'BEGINNER_2',
  'INTERMEDIATE_1',
  'INTERMEDIATE_2',
  'ADVANCED_1',
  'ADVANCED_2',
]);

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(level?: string) {
    const where: Prisma.GrammarLessonWhereInput = {};
    if (level && VALID_LEVELS.has(level)) {
      where.level = level as GrammarLevel;
    }
    return this.prisma.grammarLesson.findMany({
      where,
      orderBy: LESSON_LIST_ORDER,
      include: LESSON_LIST_COUNTS_INCLUDE,
    });
  }

  async get(id: string) {
    const lesson = await this.prisma.grammarLesson.findUnique({
      where: { id },
      include: lessonDetailInclude,
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async listExercises(lessonId: string) {
    const lesson = await this.prisma.grammarLesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return this.prisma.grammarExercise.findMany({
      where: { lessonId },
      orderBy: EXERCISE_LIST_ORDER,
    });
  }
}
