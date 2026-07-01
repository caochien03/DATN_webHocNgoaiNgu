import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ToeicTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createQuestionsForExam,
  examWithQuestionsInclude,
  replaceExamQuestions,
  validateExamQuestions,
} from './admin-toeic-exam-questions.helper';
import {
  AddToeicExamQuestionDto,
  CreateToeicExamWithQuestionsDto,
  UpdateToeicExamDto,
} from './dto/toeic-exam.dto';

@Injectable()
export class AdminToeicExamsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.toeicExam.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  async get(id: string) {
    const exam = await this.prisma.toeicExam.findUnique({
      where: { id },
      include: examWithQuestionsInclude,
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  async createWithQuestions(dto: CreateToeicExamWithQuestionsDto) {
    const tier = dto.tier ?? ToeicTier.TOEIC_LR;
    validateExamQuestions(tier, dto.questions);

    return this.prisma.$transaction(async (tx) => {
      const exam = await tx.toeicExam.create({
        data: {
          title: dto.title,
          description: dto.description,
          tier,
          ...(dto.durationMinutes !== undefined && {
            durationMinutes: dto.durationMinutes,
          }),
          ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        },
      });

      await createQuestionsForExam(tx, exam.id, tier, dto.questions);

      return tx.toeicExam.findUniqueOrThrow({
        where: { id: exam.id },
        include: examWithQuestionsInclude,
      });
    });
  }

  async importFromJson(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('JSON file is required');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(file.buffer.toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid JSON file');
    }

    const dto = plainToInstance(CreateToeicExamWithQuestionsDto, parsed);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });
    if (errors.length > 0) {
      throw new BadRequestException('Invalid exam JSON');
    }

    return this.createWithQuestions(dto);
  }

  async update(id: string, dto: UpdateToeicExamDto) {
    const existing = await this.ensureExam(id);
    const tier = dto.tier ?? existing.tier;

    if (dto.questions) {
      validateExamQuestions(tier, dto.questions);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.toeicExam.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.tier !== undefined && { tier: dto.tier }),
          ...(dto.durationMinutes !== undefined && {
            durationMinutes: dto.durationMinutes,
          }),
          ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        },
      });

      if (dto.questions) {
        await replaceExamQuestions(tx, id, tier, dto.questions);
      }

      return tx.toeicExam.findUniqueOrThrow({
        where: { id },
        include: examWithQuestionsInclude,
      });
    });
  }

  async remove(id: string) {
    await this.ensureExam(id);
    const slots = await this.prisma.toeicExamQuestion.findMany({
      where: { examId: id },
      select: { questionId: true },
    });
    const questionIds = slots.map((s) => s.questionId);

    await this.prisma.$transaction(async (tx) => {
      await tx.toeicExamQuestion.deleteMany({ where: { examId: id } });
      if (questionIds.length > 0) {
        await tx.toeicQuestion.deleteMany({
          where: { id: { in: questionIds } },
        });
      }
      await tx.toeicExam.delete({ where: { id } });
    });

    return { ok: true };
  }

  async addQuestion(examId: string, dto: AddToeicExamQuestionDto) {
    const exam = await this.ensureExam(examId);
    const question = await this.prisma.toeicQuestion.findUnique({
      where: { id: dto.questionId },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (question.tier !== exam.tier) {
      throw new BadRequestException('Question tier must match exam tier');
    }

    return this.prisma.toeicExamQuestion.create({
      data: {
        examId,
        questionId: dto.questionId,
        sortOrder: dto.sortOrder,
      },
    });
  }

  private async ensureExam(id: string) {
    const exam = await this.prisma.toeicExam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }
}
