import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: { language?: string; level?: string } = {}) {
    return this.prisma.vocabularyTopic.findMany({
      where: {
        ...(filter.language && { languageCode: filter.language }),
        ...(filter.level && { level: filter.level }),
      },
      orderBy: [
        { languageCode: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      include: { _count: { select: { words: true } } },
    });
  }

  async get(id: string) {
    const topic = await this.prisma.vocabularyTopic.findUnique({
      where: { id },
      include: {
        words: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }
}
