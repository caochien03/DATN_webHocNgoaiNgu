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

  async listDecks(userId: string) {
    return this.prisma.deck.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { cards: true } } },
    });
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
    return this.prisma.card.update({
      where: { id: cardId },
      data: {
        ...(isCorrect
          ? { correctCount: { increment: 1 } }
          : { wrongCount: { increment: 1 } }),
        lastResult: isCorrect,
        lastReviewedAt: new Date(),
      },
    });
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
