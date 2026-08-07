import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  TopikQuestionType,
  TopikSection,
  TopikTier,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { assertValidQuestionNo } from '../../topik/topik-question-limits';
import { assertQuestionInput } from '../../topik/topik-question-validation';
import { parseWritingParts } from '../../topik/topik-writing-parts';
import { resolveQuestionType } from './admin-topik-exam-questions.helper';
import {
  CreateTopikQuestionDto,
  UpdateTopikQuestionDto,
} from './dto/topik-question.dto';

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
    const questionType = resolveQuestionType(dto.section, dto.questionType);
    const options = dto.options ?? [];
    const correctIndex = dto.correctIndex ?? 0;
    assertQuestionInput({
      tier: dto.tier,
      section: dto.section,
      questionType,
      options,
      correctIndex,
      minChars: dto.minChars,
      maxChars: dto.maxChars,
      writingParts: dto.writingParts,
    });

    const writingParts =
      questionType === TopikQuestionType.SHORT_ANSWER &&
      dto.writingParts?.length
        ? parseWritingParts(dto.writingParts)
        : null;

    return this.prisma.topikQuestion.create({
      data: {
        tier: dto.tier,
        section: dto.section,
        questionNo: dto.questionNo,
        questionType,
        prompt: dto.prompt,
        passage: dto.passage,
        options,
        correctIndex,
        explanation: dto.explanation,
        audioUrl: dto.audioUrl,
        imageUrl: dto.imageUrl,
        optionImageUrls: dto.optionImageUrls ?? [],
        bundleId: dto.bundleId,
        modelAnswer: dto.modelAnswer,
        ...(writingParts && {
          writingParts: writingParts as Prisma.InputJsonValue,
        }),
        minChars: dto.minChars,
        maxChars: dto.maxChars,
        maxScore: dto.maxScore,
        ...(dto.rubric !== undefined && {
          rubric: dto.rubric as Prisma.InputJsonValue,
        }),
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

    const questionType = resolveQuestionType(
      section,
      dto.questionType ?? existing.questionType,
    );
    const options = dto.options ?? existing.options;
    const correctIndex = dto.correctIndex ?? existing.correctIndex;
    assertQuestionInput({
      tier,
      section,
      questionType,
      options,
      correctIndex,
      minChars: dto.minChars ?? existing.minChars,
      maxChars: dto.maxChars ?? existing.maxChars,
      writingParts: dto.writingParts ?? existing.writingParts,
    });

    const writingParts =
      dto.writingParts !== undefined
        ? dto.writingParts?.length
          ? parseWritingParts(dto.writingParts)
          : null
        : undefined;

    return this.prisma.topikQuestion.update({
      where: { id },
      data: {
        ...(dto.tier !== undefined && { tier: dto.tier }),
        ...(dto.section !== undefined && { section: dto.section }),
        ...(dto.questionNo !== undefined && { questionNo: dto.questionNo }),
        questionType,
        ...(dto.prompt !== undefined && { prompt: dto.prompt }),
        ...(dto.passage !== undefined && { passage: dto.passage }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.correctIndex !== undefined && {
          correctIndex: dto.correctIndex,
        }),
        ...(dto.explanation !== undefined && { explanation: dto.explanation }),
        ...(dto.audioUrl !== undefined && { audioUrl: dto.audioUrl }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.optionImageUrls !== undefined && {
          optionImageUrls: dto.optionImageUrls,
        }),
        ...(dto.bundleId !== undefined && { bundleId: dto.bundleId }),
        ...(dto.modelAnswer !== undefined && { modelAnswer: dto.modelAnswer }),
        ...(writingParts !== undefined && {
          writingParts:
            writingParts === null
              ? Prisma.JsonNull
              : (writingParts as Prisma.InputJsonValue),
        }),
        ...(dto.minChars !== undefined && { minChars: dto.minChars }),
        ...(dto.maxChars !== undefined && { maxChars: dto.maxChars }),
        ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
        ...(dto.rubric !== undefined && {
          rubric:
            dto.rubric === null
              ? Prisma.JsonNull
              : (dto.rubric as Prisma.InputJsonValue),
        }),
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
