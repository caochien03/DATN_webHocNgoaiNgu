import { Injectable, NotFoundException } from '@nestjs/common';
import { TopicsService } from '../../topics/topics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateTopicWordDto, UpdateTopicWordDto } from './dto/topic-word.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class AdminTopicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly topicsService: TopicsService,
  ) {}

  list(language?: string, level?: string) {
    return this.topicsService.list({ language, level });
  }

  get(id: string) {
    return this.topicsService.get(id);
  }

  create(dto: CreateTopicDto) {
    return this.prisma.vocabularyTopic.create({
      data: {
        title: dto.title,
        description: dto.description,
        languageCode: dto.languageCode ?? 'ko',
        level: dto.level,
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async update(id: string, dto: UpdateTopicDto) {
    await this.ensureTopic(id);
    return this.prisma.vocabularyTopic.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.languageCode !== undefined && { languageCode: dto.languageCode }),
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(id: string) {
    await this.ensureTopic(id);
    await this.prisma.vocabularyTopic.delete({ where: { id } });
    return { ok: true };
  }

  async createWord(topicId: string, dto: CreateTopicWordDto) {
    await this.ensureTopic(topicId);
    return this.prisma.vocabularyWord.create({
      data: {
        topicId,
        frontText: dto.frontText,
        backText: dto.backText,
        note: dto.note,
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async updateWord(topicId: string, wordId: string, dto: UpdateTopicWordDto) {
    await this.ensureWord(topicId, wordId);
    return this.prisma.vocabularyWord.update({
      where: { id: wordId },
      data: {
        ...(dto.frontText !== undefined && { frontText: dto.frontText }),
        ...(dto.backText !== undefined && { backText: dto.backText }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async removeWord(topicId: string, wordId: string) {
    await this.ensureWord(topicId, wordId);
    await this.prisma.vocabularyWord.delete({ where: { id: wordId } });
    return { ok: true };
  }

  private async ensureTopic(id: string) {
    const topic = await this.prisma.vocabularyTopic.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
  }

  private async ensureWord(topicId: string, wordId: string) {
    const row = await this.prisma.vocabularyWord.findFirst({
      where: { id: wordId, topicId },
    });
    if (!row) {
      throw new NotFoundException('Word not found');
    }
  }
}
