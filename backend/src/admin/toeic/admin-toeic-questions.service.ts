import { Injectable, NotFoundException } from '@nestjs/common';
import { ToeicSection } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { assertValidQuestionNo } from '../../toeic/toeic-question-limits';
import { assertQuestionInput } from '../../toeic/toeic-question-validation';
import {
  CreateToeicQuestionDto,
  UpdateToeicQuestionDto,
} from './dto/toeic-question.dto';

@Injectable()
export class AdminToeicQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(section?: ToeicSection) {
    return this.prisma.toeicQuestion.findMany({
      where: { ...(section && { section }) },
      orderBy: [
        { section: 'asc' },
        { questionNo: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async get(id: string) {
    const question = await this.prisma.toeicQuestion.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  create(dto: CreateToeicQuestionDto) {
    assertValidQuestionNo(dto.tier, dto.section, dto.questionNo);
    assertQuestionInput({
      options: dto.options,
      correctIndex: dto.correctIndex,
    });

    return this.prisma.toeicQuestion.create({
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
        imageUrl: dto.imageUrl,
        optionImageUrls: dto.optionImageUrls ?? [],
        bundleId: dto.bundleId,
        points: dto.points ?? 1,
        isPublished: dto.isPublished ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateToeicQuestionDto) {
    const existing = await this.get(id);
    const tier = dto.tier ?? existing.tier;
    const section = dto.section ?? existing.section;
    const questionNo = dto.questionNo ?? existing.questionNo;
    const options = dto.options ?? existing.options;
    const correctIndex = dto.correctIndex ?? existing.correctIndex;

    assertValidQuestionNo(tier, section, questionNo);
    assertQuestionInput({ options, correctIndex });

    return this.prisma.toeicQuestion.update({
      where: { id },
      data: {
        ...(dto.tier !== undefined && { tier: dto.tier }),
        ...(dto.section !== undefined && { section: dto.section }),
        ...(dto.questionNo !== undefined && { questionNo: dto.questionNo }),
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
        ...(dto.points !== undefined && { points: dto.points }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.toeicQuestion.delete({ where: { id } });
    return { ok: true };
  }
}
