import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TopikAttemptMode, TopikSection, TopikTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubmitTopikExamDto,
  SubmitTopikPracticeDto,
} from './dto/submit-topik.dto';
import {
  assertUniqueAnswers,
  gradeTopikAnswers,
  scorePercent,
} from './topik-grading';

const questionForClient = {
  id: true,
  tier: true,
  section: true,
  questionNo: true,
  prompt: true,
  passage: true,
  options: true,
  audioUrl: true,
  points: true,
} as const;

@Injectable()
export class TopikService {
  constructor(private readonly prisma: PrismaService) {}

  listFormats(tier: TopikTier, section?: TopikSection) {
    return this.prisma.topikQuestionFormat.findMany({
      where: {
        tier,
        ...(section && { section }),
      },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  listExams(tier?: TopikTier) {
    return this.prisma.topikExam.findMany({
      where: {
        isPublished: true,
        ...(tier && { tier }),
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  async getExamForTake(examId: string) {
    const exam = await this.prisma.topikExam.findFirst({
      where: { id: examId, isPublished: true },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            question: { select: questionForClient },
          },
        },
      },
    });
    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');
    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      tier: exam.tier,
      durationMinutes: exam.durationMinutes,
      questionCount: exam.questions.length,
      questions: exam.questions.map((slot) => slot.question),
    };
  }

  async getPracticeQuestions(params: {
    tier: TopikTier;
    section: TopikSection;
    fromNo: number;
    toNo: number;
    limit?: number;
  }) {
    const limit = Math.min(params.limit ?? 10, 30);
    const questions = await this.prisma.topikQuestion.findMany({
      where: {
        tier: params.tier,
        section: params.section,
        questionNo: { gte: params.fromNo, lte: params.toNo },
        isPublished: true,
      },
      select: questionForClient,
      take: limit,
      orderBy: [{ questionNo: 'asc' }, { createdAt: 'asc' }],
    });
    return questions;
  }

  async getFormatOrThrow(
    tier: TopikTier,
    section: TopikSection,
    fromNo: number,
    toNo: number,
  ) {
    const format = await this.prisma.topikQuestionFormat.findFirst({
      where: { tier, section, fromNo, toNo },
    });
    if (!format) {
      throw new NotFoundException('Không tìm thấy dạng bài');
    }
    return format;
  }

  listAttempts(userId: string) {
    return this.prisma.topikExamAttempt.findMany({
      where: { userId },
      orderBy: { finishedAt: 'desc' },
      take: 100,
      include: {
        exam: { select: { id: true, title: true } },
      },
    });
  }

  async getAttempt(userId: string, attemptId: string) {
    const attempt = await this.prisma.topikExamAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        exam: { select: { id: true, title: true } },
      },
    });
    if (!attempt) {
      throw new NotFoundException('Không tìm thấy bài làm');
    }
    return attempt;
  }

  async submitPractice(userId: string, dto: SubmitTopikPracticeDto) {
    if (dto.fromNo > dto.toNo) {
      throw new BadRequestException('fromNo must be <= toNo');
    }
    await this.getFormatOrThrow(dto.tier, dto.section, dto.fromNo, dto.toNo);
    assertUniqueAnswers(dto.answers);

    const questionIds = dto.answers.map((a) => a.questionId);
    const questions = await this.prisma.topikQuestion.findMany({
      where: {
        id: { in: questionIds },
        isPublished: true,
        tier: dto.tier,
        section: dto.section,
        questionNo: { gte: dto.fromNo, lte: dto.toNo },
      },
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestException(
        'Một hoặc nhiều câu không hợp lệ cho dạng bài này',
      );
    }

    const { graded, correctCount } = gradeTopikAnswers(questions, dto.answers);
    const totalQuestions = dto.answers.length;
    const now = new Date();

    const attempt = await this.prisma.topikExamAttempt.create({
      data: {
        userId,
        mode: TopikAttemptMode.PRACTICE,
        tier: dto.tier,
        section: dto.section,
        formatFromNo: dto.fromNo,
        formatToNo: dto.toNo,
        answers: graded,
        correctCount,
        totalQuestions,
        scorePercent: scorePercent(correctCount, totalQuestions),
        finishedAt: now,
      },
    });

    return {
      attemptId: attempt.id,
      mode: attempt.mode,
      tier: attempt.tier,
      section: attempt.section,
      formatFromNo: attempt.formatFromNo,
      formatToNo: attempt.formatToNo,
      correctCount,
      totalQuestions,
      scorePercent: attempt.scorePercent,
      answers: graded,
    };
  }

  async submitExam(userId: string, examId: string, dto: SubmitTopikExamDto) {
    assertUniqueAnswers(dto.answers);

    const exam = await this.prisma.topikExam.findFirst({
      where: { id: examId, isPublished: true },
      include: {
        questions: {
          include: { question: true },
        },
      },
    });
    if (!exam) {
      throw new NotFoundException('Không tìm thấy đề thi');
    }

    const allowedIds = new Set(
      exam.questions.map((slot) => slot.questionId),
    );
    for (const answer of dto.answers) {
      if (!allowedIds.has(answer.questionId)) {
        throw new BadRequestException(
          `Câu ${answer.questionId} không thuộc đề thi này`,
        );
      }
    }

    const questions = exam.questions
      .map((slot) => slot.question)
      .filter((q) => dto.answers.some((a) => a.questionId === q.id));

    const { graded, correctCount } = gradeTopikAnswers(questions, dto.answers);
    const totalQuestions = dto.answers.length;
    const now = new Date();

    const attempt = await this.prisma.topikExamAttempt.create({
      data: {
        userId,
        mode: TopikAttemptMode.FULL_EXAM,
        examId: exam.id,
        tier: exam.tier,
        answers: graded,
        correctCount,
        totalQuestions,
        scorePercent: scorePercent(correctCount, totalQuestions),
        finishedAt: now,
      },
    });

    return {
      attemptId: attempt.id,
      mode: attempt.mode,
      examId: exam.id,
      examTitle: exam.title,
      tier: attempt.tier,
      correctCount,
      totalQuestions,
      scorePercent: attempt.scorePercent,
      answers: graded,
    };
  }
}
