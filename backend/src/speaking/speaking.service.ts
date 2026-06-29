import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  SpeakingSelfLevel,
  SpeakingSessionStatus,
  SpeakingTurnSpeaker,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  countRequiredGoals,
  parseSpeakingGoals,
  type SpeakingSessionTurnSummary,
  type SpeakingTurnHistoryItem,
} from './speaking-ai';
import { SpeakingAiService } from './speaking-ai.service';
import { CreateSpeakingSessionDto } from './dto/create-speaking-session.dto';
import {
  mapSessionDetail,
  mapSessionListItem,
  mapSituationSummary,
} from './speaking.mapper';

const HISTORY_TURN_LIMIT = 8;

@Injectable()
export class SpeakingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: SpeakingAiService,
  ) {}

  listTopics() {
    return this.prisma.speakingTopic.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        titleKo: true,
        description: true,
        sortOrder: true,
      },
    });
  }

  listSituations(params: {
    topicIds?: string[];
    level?: SpeakingSelfLevel;
  }) {
    const { topicIds, level } = params;
    return this.prisma.speakingSituation.findMany({
      where: {
        isPublished: true,
        ...(level && { level }),
        ...(topicIds &&
          topicIds.length > 0 && {
            OR: [{ topicId: { in: topicIds } }, { topicId: null }],
          }),
      },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: {
        topic: {
          select: { id: true, title: true, titleKo: true },
        },
      },
    }).then((rows) =>
      rows.map((s) => ({
        ...mapSituationSummary(s),
        openingLineKo: s.openingLineKo,
      })),
    );
  }

  async createSession(userId: string, dto: CreateSpeakingSessionDto) {
    const situation = await this.prisma.speakingSituation.findFirst({
      where: { id: dto.situationId, isPublished: true },
      include: {
        topic: { select: { id: true, title: true, titleKo: true } },
      },
    });
    if (!situation) {
      throw new NotFoundException('Không tìm thấy tình huống luyện nói');
    }

    const goals = parseSpeakingGoals(situation.goals);
    const { total } = countRequiredGoals(goals, {});

    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.speakingSession.create({
        data: {
          userId,
          situationId: situation.id,
          selfLevel: dto.selfLevel,
          selectedTopicIds: dto.selectedTopicIds,
          filledGoals: {},
          goalsTotal: total,
          goalsCompleted: 0,
          status: SpeakingSessionStatus.IN_PROGRESS,
        },
      });

      await tx.speakingTurn.create({
        data: {
          sessionId: created.id,
          orderIndex: 0,
          speaker: SpeakingTurnSpeaker.NPC,
          text: situation.openingLineKo,
        },
      });

      return created;
    });

    return this.getSession(userId, session.id);
  }

  async listSessions(userId: string) {
    const rows = await this.prisma.speakingSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        situation: { select: { id: true, title: true, level: true } },
      },
    });
    return rows.map(mapSessionListItem);
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.loadSessionOrThrow(userId, sessionId);
    return mapSessionDetail(session);
  }

  async submitTurn(
    userId: string,
    sessionId: string,
    audio: Buffer,
    mimeType: string | undefined,
    durationSecs?: number,
  ) {
    const session = await this.loadSessionOrThrow(userId, sessionId);

    if (session.status !== SpeakingSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Phiên luyện nói đã kết thúc.');
    }

    const userTurnCount =
      session.turns.filter((t) => t.speaker === SpeakingTurnSpeaker.USER)
        .length + 1;

    if (userTurnCount > session.situation.maxUserTurns) {
      throw new BadRequestException('Đã hết số lượt nói cho phép.');
    }

    const filledGoals = (session.filledGoals ?? {}) as Record<string, string>;
    const goals = parseSpeakingGoals(session.situation.goals);
    const history = this.buildHistory(session.turns);

    const turnResult = await this.ai.processAudioTurn(audio, mimeType, {
      situationTitle: session.situation.title,
      contextVi: session.situation.contextVi,
      userRoleVi: session.situation.userRoleVi,
      npcRoleVi: session.situation.npcRoleVi,
      systemPrompt: session.situation.systemPrompt,
      goals,
      filledGoals,
      maxUserTurns: session.situation.maxUserTurns,
      userTurnCount,
      history,
    });

    const transcript = turnResult.transcript;

    const nextOrder =
      session.turns.length > 0
        ? Math.max(...session.turns.map((t) => t.orderIndex)) + 1
        : 0;

    const goalCounts = countRequiredGoals(goals, turnResult.filledGoals);

    await this.prisma.$transaction(async (tx) => {
      await tx.speakingTurn.create({
        data: {
          sessionId: session.id,
          orderIndex: nextOrder,
          speaker: SpeakingTurnSpeaker.USER,
          text: transcript,
          durationSecs: durationSecs ?? null,
        },
      });

      await tx.speakingTurn.create({
        data: {
          sessionId: session.id,
          orderIndex: nextOrder + 1,
          speaker: SpeakingTurnSpeaker.NPC,
          text: turnResult.npcReply,
        },
      });

      await tx.speakingSession.update({
        where: { id: session.id },
        data: {
          filledGoals: turnResult.filledGoals,
          goalsCompleted: goalCounts.completed,
          goalsTotal: goalCounts.total,
        },
      });
    });

    if (turnResult.shouldEnd) {
      return this.completeSession(userId, sessionId);
    }

    const updated = await this.getSession(userId, sessionId);
    return {
      ...updated,
      lastTurn: {
        transcript,
        npcReply: turnResult.npcReply,
        allRequiredGoalsMet: turnResult.allRequiredGoalsMet,
        shouldEnd: false,
      },
    };
  }

  async completeSession(userId: string, sessionId: string) {
    const session = await this.loadSessionOrThrow(userId, sessionId);

    if (session.status === SpeakingSessionStatus.COMPLETED) {
      return mapSessionDetail(session);
    }

    const filledGoals = (session.filledGoals ?? {}) as Record<string, string>;
    const goals = parseSpeakingGoals(session.situation.goals);
    const userTurns = session.turns.filter(
      (t) => t.speaker === SpeakingTurnSpeaker.USER,
    );

    const turnSummaries: SpeakingSessionTurnSummary[] = userTurns.map((t) => ({
      orderIndex: t.orderIndex,
      transcript: t.text,
    }));

    const summary = await this.ai.summarizeSession({
      situationTitle: session.situation.title,
      selfLevel: session.selfLevel,
      goals,
      filledGoals,
      turns: turnSummaries,
    });

    const goalCounts = countRequiredGoals(goals, filledGoals);
    const gradingByOrder = new Map(
      summary.turnGradings.map((g) => [g.orderIndex, g.grading]),
    );

    const completed = await this.prisma.$transaction(async (tx) => {
      for (const turn of userTurns) {
        const grading = gradingByOrder.get(turn.orderIndex);
        if (!grading) continue;
        await tx.speakingTurn.update({
          where: { id: turn.id },
          data: {
            grading: grading as unknown as Prisma.InputJsonValue,
          },
        });
      }

      return tx.speakingSession.update({
        where: { id: session.id },
        data: {
          status: SpeakingSessionStatus.COMPLETED,
          completedAt: new Date(),
          overallScore: summary.overallScore,
          estimatedLevel: summary.estimatedLevel,
          summaryFeedback: summary.summaryFeedback,
          goalsCompleted: goalCounts.completed,
          goalsTotal: goalCounts.total,
        },
        include: {
          situation: {
            include: {
              topic: { select: { id: true, title: true, titleKo: true } },
            },
          },
          turns: { orderBy: { orderIndex: 'asc' } },
        },
      });
    });

    return mapSessionDetail(completed);
  }

  private async loadSessionOrThrow(userId: string, sessionId: string) {
    const session = await this.prisma.speakingSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        situation: {
          include: {
            topic: { select: { id: true, title: true, titleKo: true } },
          },
        },
        turns: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!session) {
      throw new NotFoundException('Không tìm thấy phiên luyện nói');
    }
    return session;
  }

  private buildHistory(
    turns: { speaker: SpeakingTurnSpeaker; text: string }[],
  ): SpeakingTurnHistoryItem[] {
    return turns.slice(-HISTORY_TURN_LIMIT).map((t) => ({
      speaker: t.speaker,
      text: t.text,
    }));
  }
}
