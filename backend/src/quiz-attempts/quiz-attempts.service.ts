import { Injectable } from '@nestjs/common';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizAttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(userId: string, dto: CreateQuizAttemptDto) {
    const safeCorrectAnswers = Math.min(dto.correctAnswers, dto.totalQuestions);
    return this.prisma.quizAttempt.create({
      data: {
        userId,
        sourceType: dto.sourceType,
        sourceId: dto.sourceId,
        sourceTitle: dto.sourceTitle,
        totalQuestions: dto.totalQuestions,
        correctAnswers: safeCorrectAnswers,
        scorePercent: dto.scorePercent,
      },
    });
  }
}
