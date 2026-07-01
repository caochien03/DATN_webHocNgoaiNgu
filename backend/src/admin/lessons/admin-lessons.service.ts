import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LessonsService } from '../../lessons/lessons.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import {
  CreateGrammarExerciseDto,
  UpdateGrammarExerciseDto,
} from './dto/grammar-exercise.dto';
import {
  CreateGrammarPointDto,
  UpdateGrammarPointDto,
} from './dto/grammar-point.dto';
import {
  CreateLessonVocabularyDto,
  UpdateLessonVocabularyDto,
} from './dto/lesson-vocabulary.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class AdminLessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lessonsService: LessonsService,
  ) {}

  list() {
    return this.lessonsService.list();
  }

  get(id: string) {
    return this.lessonsService.getForAdmin(id);
  }

  create(dto: CreateLessonDto) {
    return this.prisma.grammarLesson.create({
      data: {
        level: dto.level,
        title: dto.title,
        summary: dto.summary,
        languageCode: dto.languageCode ?? 'ko',
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.ensureLesson(id);
    return this.prisma.grammarLesson.update({
      where: { id },
      data: {
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.languageCode !== undefined && { languageCode: dto.languageCode }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(id: string) {
    await this.ensureLesson(id);
    await this.prisma.grammarLesson.delete({ where: { id } });
    return { ok: true };
  }

  async createVocabulary(lessonId: string, dto: CreateLessonVocabularyDto) {
    await this.ensureLesson(lessonId);
    return this.prisma.lessonVocabulary.create({
      data: {
        lessonId,
        frontText: dto.frontText,
        backText: dto.backText,
        note: dto.note,
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async updateVocabulary(
    lessonId: string,
    vocabId: string,
    dto: UpdateLessonVocabularyDto,
  ) {
    await this.ensureVocabulary(lessonId, vocabId);
    return this.prisma.lessonVocabulary.update({
      where: { id: vocabId },
      data: {
        ...(dto.frontText !== undefined && { frontText: dto.frontText }),
        ...(dto.backText !== undefined && { backText: dto.backText }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async removeVocabulary(lessonId: string, vocabId: string) {
    await this.ensureVocabulary(lessonId, vocabId);
    await this.prisma.lessonVocabulary.delete({ where: { id: vocabId } });
    return { ok: true };
  }

  async createPoint(lessonId: string, dto: CreateGrammarPointDto) {
    await this.ensureLesson(lessonId);
    return this.prisma.grammarPoint.create({
      data: {
        lessonId,
        title: dto.title,
        meaning: dto.meaning,
        structure: dto.structure,
        example: dto.example,
        translation: dto.translation,
        note: dto.note,
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async updatePoint(
    lessonId: string,
    pointId: string,
    dto: UpdateGrammarPointDto,
  ) {
    await this.ensurePoint(lessonId, pointId);
    return this.prisma.grammarPoint.update({
      where: { id: pointId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.meaning !== undefined && { meaning: dto.meaning }),
        ...(dto.structure !== undefined && { structure: dto.structure }),
        ...(dto.example !== undefined && { example: dto.example }),
        ...(dto.translation !== undefined && { translation: dto.translation }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async removePoint(lessonId: string, pointId: string) {
    await this.ensurePoint(lessonId, pointId);
    await this.prisma.grammarPoint.delete({ where: { id: pointId } });
    return { ok: true };
  }

  async createExercise(lessonId: string, dto: CreateGrammarExerciseDto) {
    await this.ensureLesson(lessonId);
    this.validateExerciseOptions(dto.options, dto.correctIndex);
    return this.prisma.grammarExercise.create({
      data: {
        lessonId,
        prompt: dto.prompt,
        options: dto.options,
        correctIndex: dto.correctIndex,
        explanation: dto.explanation,
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async updateExercise(
    lessonId: string,
    exerciseId: string,
    dto: UpdateGrammarExerciseDto,
  ) {
    const existing = await this.ensureExercise(lessonId, exerciseId);
    const options = dto.options ?? existing.options;
    const correctIndex = dto.correctIndex ?? existing.correctIndex;
    this.validateExerciseOptions(options, correctIndex);
    return this.prisma.grammarExercise.update({
      where: { id: exerciseId },
      data: {
        ...(dto.prompt !== undefined && { prompt: dto.prompt }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.correctIndex !== undefined && { correctIndex: dto.correctIndex }),
        ...(dto.explanation !== undefined && { explanation: dto.explanation }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async removeExercise(lessonId: string, exerciseId: string) {
    await this.ensureExercise(lessonId, exerciseId);
    await this.prisma.grammarExercise.delete({ where: { id: exerciseId } });
    return { ok: true };
  }

  private validateExerciseOptions(options: string[], correctIndex: number) {
    if (correctIndex < 0 || correctIndex >= options.length) {
      throw new BadRequestException(
        'correctIndex is out of range for options',
      );
    }
  }

  private async ensureLesson(id: string) {
    const lesson = await this.prisma.grammarLesson.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
  }

  private async ensureVocabulary(lessonId: string, vocabId: string) {
    const row = await this.prisma.lessonVocabulary.findFirst({
      where: { id: vocabId, lessonId },
    });
    if (!row) {
      throw new NotFoundException('Vocabulary not found');
    }
  }

  private async ensurePoint(lessonId: string, pointId: string) {
    const row = await this.prisma.grammarPoint.findFirst({
      where: { id: pointId, lessonId },
    });
    if (!row) {
      throw new NotFoundException('Grammar point not found');
    }
  }

  private async ensureExercise(lessonId: string, exerciseId: string) {
    const row = await this.prisma.grammarExercise.findFirst({
      where: { id: exerciseId, lessonId },
    });
    if (!row) {
      throw new NotFoundException('Exercise not found');
    }
    return row;
  }
}
