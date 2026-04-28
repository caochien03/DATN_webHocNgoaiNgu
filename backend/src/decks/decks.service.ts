import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  private static nextIntervalDays(streak: number) {
    if (streak <= 1) return 2;
    if (streak === 2) return 4;
    if (streak === 3) return 7;
    if (streak === 4) return 14;
    return 30;
  }

  private static addDays(from: Date, days: number) {
    return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  }

  async listDecks(userId: string) {
    const decks = await this.prisma.deck.findMany({
      where: { userId, sourceTopicId: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        updatedAt: true,
        cards: {
          select: { lastResult: true, lastReviewedAt: true },
        },
      },
    });

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let totalCards = 0;
    let totalLearned = 0;
    let totalWeak = 0;
    let totalReviewed = 0;
    let reviewedToday = 0;
    let reviewedLast7Days = 0;

    const deckRows = decks.map((d) => {
      let learned = 0;
      let weak = 0;
      let reviewed = 0;
      for (const c of d.cards) {
        totalCards += 1;
        if (c.lastResult === true) {
          learned += 1;
          totalLearned += 1;
        }
        if (c.lastResult === false) {
          weak += 1;
          totalWeak += 1;
        }
        if (c.lastReviewedAt) {
          reviewed += 1;
          totalReviewed += 1;
          if (c.lastReviewedAt >= startOfToday) reviewedToday += 1;
          if (c.lastReviewedAt >= sevenDaysAgo) reviewedLast7Days += 1;
        }
      }
      return {
        id: d.id,
        title: d.title,
        description: d.description,
        updatedAt: d.updatedAt,
        total: d.cards.length,
        learned,
        weak,
        reviewed,
      };
    });

    return {
      decks: deckRows,
      totals: {
        decks: deckRows.length,
        cards: totalCards,
        learned: totalLearned,
        weak: totalWeak,
        reviewed: totalReviewed,
        reviewedToday,
        reviewedLast7Days,
      },
    };
  }

  async getDeck(deckId: string, userId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, userId },
      include: {
        cards: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });
    if (!deck) {
      throw new NotFoundException('Deck not found');
    }
    return deck;
  }

  async createDeck(userId: string, dto: CreateDeckDto) {
    return this.prisma.deck.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async updateDeck(deckId: string, userId: string, dto: UpdateDeckDto) {
    await this.ensureDeckOwned(deckId, userId);
    return this.prisma.deck.update({
      where: { id: deckId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async deleteDeck(deckId: string, userId: string) {
    await this.ensureDeckOwned(deckId, userId);
    await this.prisma.deck.delete({ where: { id: deckId } });
  }

  async createCard(deckId: string, userId: string, dto: CreateCardDto) {
    await this.ensureDeckOwned(deckId, userId);
    return this.prisma.card.create({
      data: {
        deckId,
        frontText: dto.frontText,
        backText: dto.backText,
        note: dto.note,
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async updateCard(cardId: string, userId: string, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    if (card.deck.userId !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.card.update({
      where: { id: cardId },
      data: {
        ...(dto.frontText !== undefined && { frontText: dto.frontText }),
        ...(dto.backText !== undefined && { backText: dto.backText }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async deleteCard(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    if (card.deck.userId !== userId) {
      throw new ForbiddenException();
    }
    await this.prisma.card.delete({ where: { id: cardId } });
  }

  async recordAttempt(cardId: string, userId: string, isCorrect: boolean) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    if (card.deck.userId !== userId) {
      throw new ForbiddenException();
    }
    const now = new Date();
    const nextStreak = isCorrect ? card.streak + 1 : 0;
    const nextReviewAt = isCorrect
      ? DecksService.addDays(now, DecksService.nextIntervalDays(nextStreak))
      : DecksService.addDays(now, 1);
    return this.prisma.card.update({
      where: { id: cardId },
      data: {
        ...(isCorrect
          ? { correctCount: { increment: 1 } }
          : { wrongCount: { increment: 1 } }),
        streak: nextStreak,
        lastResult: isCorrect,
        lastReviewedAt: now,
        nextReviewAt,
      },
    });
  }

  async listReviewToday(userId: string, limit = 20) {
    const safeLimit = Number.isFinite(limit)
      ? Math.min(Math.max(limit, 1), 100)
      : 20;
    const now = new Date();
    const cards = await this.prisma.card.findMany({
      where: {
        deck: { userId, sourceTopicId: null },
        OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }],
      },
      include: { deck: { select: { id: true, title: true } } },
      orderBy: [{ nextReviewAt: 'asc' }, { updatedAt: 'asc' }],
      take: safeLimit * 4,
    });

    const prioritized = cards.sort((a, b) => {
      const aPriority = a.lastResult === false ? 0 : a.nextReviewAt ? 1 : 2;
      const bPriority = b.lastResult === false ? 0 : b.nextReviewAt ? 1 : 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      const aAt = a.nextReviewAt?.getTime() ?? 0;
      const bAt = b.nextReviewAt?.getTime() ?? 0;
      if (aAt !== bAt) return aAt - bAt;
      return b.wrongCount - a.wrongCount;
    });

    return prioritized.slice(0, safeLimit).map((c) => ({
      id: c.id,
      deckId: c.deckId,
      deckTitle: c.deck.title,
      frontText: c.frontText,
      backText: c.backText,
      note: c.note,
      streak: c.streak,
      correctCount: c.correctCount,
      wrongCount: c.wrongCount,
      lastResult: c.lastResult,
      lastReviewedAt: c.lastReviewedAt,
      nextReviewAt: c.nextReviewAt,
    }));
  }

  async getReviewTodaySummary(userId: string) {
    const now = new Date();
    const dueCount = await this.prisma.card.count({
      where: {
        deck: { userId, sourceTopicId: null },
        OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }],
      },
    });
    return { dueCount };
  }

  private async ensureDeckOwned(deckId: string, userId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, userId },
    });
    if (!deck) {
      throw new NotFoundException('Deck not found');
    }
  }
}
