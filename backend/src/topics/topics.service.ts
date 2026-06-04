import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TOPIC_LIST_COUNTS_INCLUDE,
  TOPIC_LIST_ORDER,
  topicDetailInclude,
} from './topic-queries';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: { language?: string; level?: string } = {}) {
    return this.prisma.vocabularyTopic.findMany({
      where: {
        ...(filter.language && { languageCode: filter.language }),
        ...(filter.level && { level: filter.level }),
      },
      orderBy: TOPIC_LIST_ORDER,
      include: TOPIC_LIST_COUNTS_INCLUDE,
    });
  }

  async get(id: string) {
    const topic = await this.prisma.vocabularyTopic.findUnique({
      where: { id },
      include: topicDetailInclude,
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }
}
