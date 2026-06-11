import { Injectable, NotFoundException } from '@nestjs/common';
import { TopikSection, TopikTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  assertValidQuestionNo,
  validateOptions,
} from '../../topik/topik-question-limits';
import { CreateTopikQuestionDto, UpdateTopikQuestionDto } from './dto/topik-question.dto';

@Injectable()
export class AdminTopikQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(params: {
    tier?: TopikTier;
    section?: TopikSection;
    questionNo?: number;
    fromNo?: number;
    toNo?: number;
  }) {
    return this.prisma.topikQuestion.findMany({
      where: {
        ...(params.tier && { tier: params.tier }),
        ...(params.section && { section: params.section }),
        ...(params.questionNo !== undefined && {
          questionNo: params.questionNo,
        }),
        ...(params.fromNo !== undefined &&
          params.toNo !== undefined && {
            questionNo: { gte: params.fromNo, lte: params.toNo },
          }),
      },
      orderBy: [
        { tier: 'asc' },
        { section: 'asc' },
        { questionNo: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async get(id: string) {
    const question = await this.prisma.topikQuestion.findUnique({
      where: { id },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  create(dto: CreateTopikQuestionDto) {
    assertValidQuestionNo(dto.tier, dto.section, dto.questionNo);
    validateOptions(dto.correctIndex, dto.options);
    return this.prisma.topikQuestion.create({
      data: {
        tier: dto.tier,
        section: dto.section,
        questionNo: dto.questionNo,
        prompt: dto.prompt,
        passage: dto.passage,
        options: dto.options,
        correctIndex: dto.correctIndex,
        explanation: dto.explanation,
        audioUrl: dto.audioUrl,
        bundleId: dto.bundleId,
        ...(dto.points !== undefined && { points: dto.points }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async update(id: string, dto: UpdateTopikQuestionDto) {
    const existing = await this.get(id);
    const tier = dto.tier ?? existing.tier;
    const section = dto.section ?? existing.section;
    const questionNo = dto.questionNo ?? existing.questionNo;
    assertValidQuestionNo(tier, section, questionNo);

    const options = dto.options ?? existing.options;
    const correctIndex = dto.correctIndex ?? existing.correctIndex;
    validateOptions(correctIndex, options);

    return this.prisma.topikQuestion.update({
      where: { id },
      data: {
        ...(dto.tier !== undefined && { tier: dto.tier }),
        ...(dto.section !== undefined && { section: dto.section }),
        ...(dto.questionNo !== undefined && { questionNo: dto.questionNo }),
        ...(dto.prompt !== undefined && { prompt: dto.prompt }),
        ...(dto.passage !== undefined && { passage: dto.passage }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.correctIndex !== undefined && { correctIndex: dto.correctIndex }),
        ...(dto.explanation !== undefined && { explanation: dto.explanation }),
        ...(dto.audioUrl !== undefined && { audioUrl: dto.audioUrl }),
        ...(dto.bundleId !== undefined && { bundleId: dto.bundleId }),
        ...(dto.points !== undefined && { points: dto.points }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.topikQuestion.delete({ where: { id } });
    return { ok: true };
  }
}
