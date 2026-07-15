import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSpeakingTopicDto,
  UpdateSpeakingTopicDto,
  CreateSpeakingSituationDto,
  UpdateSpeakingSituationDto,
} from './dto/speaking-admin.dto';

@Injectable()
export class AdminSpeakingService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Topics ────────────────────────────────────────────────────────────────

  listTopics(languageCode?: string) {
    return this.prisma.speakingTopic.findMany({
      where: languageCode ? { languageCode } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { situations: true } },
      },
    });
  }

  getTopic(id: string) {
    return this.prisma.speakingTopic.findUniqueOrThrow({ where: { id } });
  }

  createTopic(dto: CreateSpeakingTopicDto) {
    return this.prisma.speakingTopic.create({
      data: {
        title: dto.title,
        titleNative: dto.titleNative ?? null,
        description: dto.description ?? null,
        languageCode: dto.languageCode ?? 'ko',
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  updateTopic(id: string, dto: UpdateSpeakingTopicDto) {
    return this.prisma.speakingTopic.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.titleNative !== undefined && { titleNative: dto.titleNative }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.languageCode !== undefined && { languageCode: dto.languageCode }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async removeTopic(id: string) {
    await this.prisma.speakingTopic.delete({ where: { id } });
    return { success: true };
  }

  // ─── Situations ────────────────────────────────────────────────────────────

  listSituations(params: { topicId?: string; languageCode?: string }) {
    return this.prisma.speakingSituation.findMany({
      where: {
        ...(params.topicId && { topicId: params.topicId }),
        ...(params.languageCode && { languageCode: params.languageCode }),
      },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: {
        topic: { select: { id: true, title: true } },
        _count: { select: { sessions: true } },
      },
    });
  }

  getSituation(id: string) {
    return this.prisma.speakingSituation.findUniqueOrThrow({
      where: { id },
      include: { topic: { select: { id: true, title: true } } },
    });
  }

  createSituation(dto: CreateSpeakingSituationDto) {
    return this.prisma.speakingSituation.create({
      data: {
        title: dto.title,
        topicId: dto.topicId ?? null,
        languageCode: dto.languageCode,
        level: (dto.level ?? undefined) as Parameters<typeof this.prisma.speakingSituation.create>[0]['data']['level'],
        contextVi: dto.contextVi,
        userRoleVi: dto.userRoleVi,
        npcRoleVi: dto.npcRoleVi,
        openingLine: dto.openingLine,
        systemPrompt: dto.systemPrompt,
        goals: (dto.goals ?? []) as object[],
        maxUserTurns: dto.maxUserTurns ?? 6,
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  updateSituation(id: string, dto: UpdateSpeakingSituationDto) {
    return this.prisma.speakingSituation.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.topicId !== undefined && { topicId: dto.topicId }),
        ...(dto.languageCode !== undefined && { languageCode: dto.languageCode }),
        ...(dto.level !== undefined && { level: dto.level ?? null }),
        ...(dto.contextVi !== undefined && { contextVi: dto.contextVi }),
        ...(dto.userRoleVi !== undefined && { userRoleVi: dto.userRoleVi }),
        ...(dto.npcRoleVi !== undefined && { npcRoleVi: dto.npcRoleVi }),
        ...(dto.openingLine !== undefined && { openingLine: dto.openingLine }),
        ...(dto.systemPrompt !== undefined && { systemPrompt: dto.systemPrompt }),
        ...(dto.goals !== undefined && { goals: dto.goals as object[] }),
        ...(dto.maxUserTurns !== undefined && { maxUserTurns: dto.maxUserTurns }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async removeSituation(id: string) {
    await this.prisma.speakingSituation.delete({ where: { id } });
    return { success: true };
  }
}
