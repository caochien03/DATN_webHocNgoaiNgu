import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LearningPathStepType } from '@prisma/client';
import { PathsService } from '../../paths/paths.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePathDto } from './dto/create-path.dto';
import { CreatePathStepDto, UpdatePathStepDto } from './dto/path-step.dto';
import { UpdatePathDto } from './dto/update-path.dto';

@Injectable()
export class AdminPathsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pathsService: PathsService,
  ) {}

  list() {
    return this.pathsService.listCatalog();
  }

  get(id: string) {
    return this.pathsService.getForAdmin(id);
  }

  create(dto: CreatePathDto) {
    return this.prisma.learningPath.create({
      data: {
        title: dto.title,
        description: dto.description,
        languageCode: dto.languageCode ?? 'ko',
        level: dto.level,
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async update(id: string, dto: UpdatePathDto) {
    const existing = await this.ensurePath(id);
    if (
      dto.languageCode !== undefined &&
      dto.languageCode !== existing.languageCode
    ) {
      const stepCount = await this.prisma.learningPathStep.count({
        where: { pathId: id },
      });
      if (stepCount > 0) {
        throw new BadRequestException(
          'Không thể đổi ngôn ngữ của lộ trình đã có bước học',
        );
      }
    }
    return this.prisma.learningPath.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.languageCode !== undefined && {
          languageCode: dto.languageCode,
        }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(id: string) {
    await this.ensurePath(id);
    await this.prisma.learningPath.delete({ where: { id } });
    return { ok: true };
  }

  async createStep(pathId: string, dto: CreatePathStepDto) {
    const path = await this.ensurePath(pathId);
    this.validateStepLinks(dto.type, dto.topicId, dto.lessonId);
    await this.ensureLinkedResources(
      path.languageCode,
      dto.type,
      dto.topicId,
      dto.lessonId,
    );
    return this.prisma.learningPathStep.create({
      data: {
        pathId,
        type: dto.type,
        title: dto.title,
        summary: dto.summary,
        topicId: dto.type === LearningPathStepType.TOPIC ? dto.topicId : null,
        lessonId:
          dto.type === LearningPathStepType.LESSON ? dto.lessonId : null,
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async updateStep(pathId: string, stepId: string, dto: UpdatePathStepDto) {
    const path = await this.ensurePath(pathId);
    const existing = await this.ensureStep(pathId, stepId);
    const type = dto.type ?? existing.type;
    const topicId = dto.topicId !== undefined ? dto.topicId : existing.topicId;
    const lessonId =
      dto.lessonId !== undefined ? dto.lessonId : existing.lessonId;
    this.validateStepLinks(type, topicId, lessonId);
    await this.ensureLinkedResources(
      path.languageCode,
      type,
      topicId,
      lessonId,
    );

    return this.prisma.learningPathStep.update({
      where: { id: stepId },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        topicId: type === LearningPathStepType.TOPIC ? topicId : null,
        lessonId: type === LearningPathStepType.LESSON ? lessonId : null,
      },
    });
  }

  async removeStep(pathId: string, stepId: string) {
    await this.ensureStep(pathId, stepId);
    await this.prisma.learningPathStep.delete({ where: { id: stepId } });
    return { ok: true };
  }

  private validateStepLinks(
    type: LearningPathStepType,
    topicId?: string | null,
    lessonId?: string | null,
  ) {
    if (type === LearningPathStepType.TOPIC) {
      if (!topicId) {
        throw new BadRequestException('TOPIC step requires topicId');
      }
      if (lessonId) {
        throw new BadRequestException('TOPIC step must not have lessonId');
      }
      return;
    }
    if (!lessonId) {
      throw new BadRequestException('LESSON step requires lessonId');
    }
    if (topicId) {
      throw new BadRequestException('LESSON step must not have topicId');
    }
  }

  private async ensureLinkedResources(
    pathLanguageCode: string,
    type: LearningPathStepType,
    topicId?: string | null,
    lessonId?: string | null,
  ) {
    if (type === LearningPathStepType.TOPIC && topicId) {
      const topic = await this.prisma.vocabularyTopic.findUnique({
        where: { id: topicId },
        select: { id: true, languageCode: true },
      });
      if (!topic) throw new NotFoundException('Topic not found');
      if (topic.languageCode !== pathLanguageCode) {
        throw new BadRequestException(
          'Ngôn ngữ của chủ đề phải trùng với ngôn ngữ lộ trình',
        );
      }
    }
    if (type === LearningPathStepType.LESSON && lessonId) {
      const lesson = await this.prisma.grammarLesson.findUnique({
        where: { id: lessonId },
        select: { id: true, languageCode: true },
      });
      if (!lesson) throw new NotFoundException('Lesson not found');
      if (lesson.languageCode !== pathLanguageCode) {
        throw new BadRequestException(
          'Ngôn ngữ của bài học phải trùng với ngôn ngữ lộ trình',
        );
      }
    }
  }

  private async ensurePath(id: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      select: { id: true, languageCode: true },
    });
    if (!path) {
      throw new NotFoundException('Learning path not found');
    }
    return path;
  }

  private async ensureStep(pathId: string, stepId: string) {
    const row = await this.prisma.learningPathStep.findFirst({
      where: { id: stepId, pathId },
    });
    if (!row) {
      throw new NotFoundException('Path step not found');
    }
    return row;
  }
}
