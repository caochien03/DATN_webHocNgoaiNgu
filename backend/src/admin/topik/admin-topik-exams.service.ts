import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createQuestionsForExam,
  examWithQuestionsInclude,
  replaceExamQuestions,
  validateExamQuestions,
} from './admin-topik-exam-questions.helper';
import {
  AddTopikExamQuestionDto,
  CreateTopikExamWithQuestionsDto,
  UpdateTopikExamDto,
} from './dto/topik-exam.dto';

@Injectable()
export class AdminTopikExamsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.topikExam.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  async get(id: string) {
    const exam = await this.prisma.topikExam.findUnique({
      where: { id },
      include: examWithQuestionsInclude,
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  async createWithQuestions(dto: CreateTopikExamWithQuestionsDto) {
    validateExamQuestions(dto.tier, dto.questions);

    return this.prisma.$transaction(async (tx) => {
      const exam = await tx.topikExam.create({
        data: {
          title: dto.title,
          description: dto.description,
          tier: dto.tier,
          ...(dto.durationMinutes !== undefined && {
            durationMinutes: dto.durationMinutes,
          }),
          ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        },
      });

      await createQuestionsForExam(tx, exam.id, exam.tier, dto.questions);

      return tx.topikExam.findUniqueOrThrow({
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

    const dto = plainToInstance(CreateTopikExamWithQuestionsDto, parsed);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });
    if (errors.length > 0) {
      throw new BadRequestException(this.formatValidationErrors(errors));
    }

    return this.createWithQuestions(dto);
  }

  async update(id: string, dto: UpdateTopikExamDto) {
    const existing = await this.ensureExam(id);
    const tier = dto.tier ?? existing.tier;

    if (dto.questions) {
      validateExamQuestions(tier, dto.questions);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.topikExam.update({
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

      return tx.topikExam.findUniqueOrThrow({
        where: { id },
        include: examWithQuestionsInclude,
      });
    });
  }

  async remove(id: string) {
    await this.ensureExam(id);

    await this.prisma.$transaction(async (tx) => {
      const slots = await tx.topikExamQuestion.findMany({
        where: { examId: id },
        select: { questionId: true },
      });
      const questionIds = slots.map((s) => s.questionId);

      await tx.topikExam.delete({ where: { id } });

      if (questionIds.length > 0) {
        await tx.topikQuestion.deleteMany({
          where: { id: { in: questionIds } },
        });
      }
    });

    return { ok: true };
  }

  async addQuestion(examId: string, dto: AddTopikExamQuestionDto) {
    const exam = await this.ensureExam(examId);
    const question = await this.prisma.topikQuestion.findUnique({
      where: { id: dto.questionId },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (question.tier !== exam.tier) {
      throw new BadRequestException('Question tier must match exam tier');
    }

    const count = await this.prisma.topikExamQuestion.count({
      where: { examId },
    });
    const sortOrder = dto.sortOrder ?? count;

    return this.prisma.topikExamQuestion.create({
      data: {
        examId,
        questionId: dto.questionId,
        sortOrder,
      },
      include: { question: true },
    });
  }

  private async ensureExam(id: string) {
    const exam = await this.prisma.topikExam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  private formatValidationErrors(
    errors: Awaited<ReturnType<typeof validate>>,
  ): string {
    const messages: string[] = [];
    const walk = (errs: typeof errors, prefix = '') => {
      for (const err of errs) {
        const path = prefix
          ? `${prefix}.${err.property}`
          : err.property;
        if (err.constraints) {
          messages.push(
            ...Object.values(err.constraints).map((m) => `${path}: ${m}`),
          );
        }
        if (err.children?.length) {
          walk(err.children, path);
        }
      }
    };
    walk(errors);
    return messages.join('; ') || 'Validation failed';
  }
}
