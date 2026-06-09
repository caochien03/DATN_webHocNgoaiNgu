import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddTopikExamQuestionDto,
  CreateTopikExamDto,
  UpdateTopikExamDto,
  UpdateTopikExamQuestionDto,
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
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: { question: true },
        },
      },
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  create(dto: CreateTopikExamDto) {
    return this.prisma.topikExam.create({
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
  }

  async update(id: string, dto: UpdateTopikExamDto) {
    await this.ensureExam(id);
    return this.prisma.topikExam.update({
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
  }

  async remove(id: string) {
    await this.ensureExam(id);
    await this.prisma.topikExam.delete({ where: { id } });
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

  async updateQuestionSlot(
    examId: string,
    slotId: string,
    dto: UpdateTopikExamQuestionDto,
  ) {
    await this.ensureSlot(examId, slotId);
    return this.prisma.topikExamQuestion.update({
      where: { id: slotId },
      data: { sortOrder: dto.sortOrder },
      include: { question: true },
    });
  }

  async removeQuestion(examId: string, slotId: string) {
    await this.ensureSlot(examId, slotId);
    await this.prisma.topikExamQuestion.delete({ where: { id: slotId } });
    return { ok: true };
  }

  private async ensureExam(id: string) {
    const exam = await this.prisma.topikExam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  private async ensureSlot(examId: string, slotId: string) {
    const slot = await this.prisma.topikExamQuestion.findFirst({
      where: { id: slotId, examId },
    });
    if (!slot) {
      throw new NotFoundException('Exam question slot not found');
    }
    return slot;
  }
}
