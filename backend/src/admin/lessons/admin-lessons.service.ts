import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonsService } from '../../lessons/lessons.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
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
    return this.lessonsService.get(id);
  }

  create(dto: CreateLessonDto) {
    return this.prisma.grammarLesson.create({
      data: {
        level: dto.level,
        title: dto.title,
        summary: dto.summary,
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
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(id: string) {
    await this.ensureLesson(id);
    await this.prisma.grammarLesson.delete({ where: { id } });
    return { ok: true };
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
}
