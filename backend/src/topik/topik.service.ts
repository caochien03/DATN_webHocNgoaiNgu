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
import { topikExamQuestionCount } from './topik-exam-blueprint';
import {
  assertUniqueAnswers,
  gradeTopikAnswers,
  scorePercent,
} from './topik-grading';
import {
  assertNoMissingSlots,
  loadQuestionsByIds,
  questionForClient,
  randomQuestionsForExam,
  randomQuestionsForPractice,
} from './topik-random';

const PRACTICE_COUNT_DEFAULT = 10;
const PRACTICE_COUNT_MAX = 50;

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

  async listExams(tier?: TopikTier) {
    const exams = await this.prisma.topikExam.findMany({
      where: {
        isPublished: true,
        ...(tier && { tier }),
      },
      orderBy: { sortOrder: 'asc' },
    });
    return exams.map((exam) => ({
      ...exam,
      questionCount: topikExamQuestionCount(exam.tier),
    }));
  }

  async getExamForTake(examId: string) {
    const exam = await this.prisma.topikExam.findFirst({
      where: { id: examId, isPublished: true },
    });
    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');
    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      tier: exam.tier,
      durationMinutes: exam.durationMinutes,
      questionCount: topikExamQuestionCount(exam.tier),
    };
  }

  async startExam(userId: string, examId: string) {
    const exam = await this.prisma.topikExam.findFirst({
      where: { id: examId, isPublished: true },
    });
    if (!exam) {
      throw new NotFoundException('Không tìm thấy đề thi');
    }

    const inProgress = await this.prisma.topikExamAttempt.findFirst({
      where: {
        userId,
        examId,
        mode: TopikAttemptMode.FULL_EXAM,
        finishedAt: null,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (inProgress && inProgress.questionIds.length > 0) {
      const questions = await loadQuestionsByIds(
        this.prisma,
        inProgress.questionIds,
      );
      return {
        attemptId: inProgress.id,
        id: exam.id,
        title: exam.title,
        description: exam.description,
        tier: exam.tier,
        durationMinutes: exam.durationMinutes,
        questionCount: questions.length,
        questions,
        resumed: true,
      };
    }

    const { questions, missingSlots } = await randomQuestionsForExam(
      this.prisma,
      exam.tier,
    );
    assertNoMissingSlots(
      missingSlots,
      'Không đủ câu trong ngân hàng để tạo đề thi',
    );

    const questionIds = questions.map((q) => q.id);
    const attempt = await this.prisma.topikExamAttempt.create({
      data: {
        userId,
        mode: TopikAttemptMode.FULL_EXAM,
        examId: exam.id,
        tier: exam.tier,
        questionIds,
        answers: [],
        totalQuestions: questionIds.length,
      },
    });

    return {
      attemptId: attempt.id,
      id: exam.id,
      title: exam.title,
      description: exam.description,
      tier: exam.tier,
      durationMinutes: exam.durationMinutes,
      questionCount: questions.length,
      questions,
      resumed: false,
    };
  }

  resolvePracticeCount(count?: number): number {
    const n = count ?? PRACTICE_COUNT_DEFAULT;
    if (!Number.isFinite(n) || n < 1) {
      throw new BadRequestException('count must be >= 1');
    }
    return Math.min(Math.floor(n), PRACTICE_COUNT_MAX);
  }

  async getPracticeQuestions(params: {
    tier: TopikTier;
    section: TopikSection;
    fromNo: number;
    toNo: number;
    count?: number;
  }) {
    const count = this.resolvePracticeCount(params.count);
    return randomQuestionsForPractice(this.prisma, { ...params, count });
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
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
      take: 100,
      include: {
        exam: { select: { id: true, title: true } },
      },
    });
  }

  async getAttempt(userId: string, attemptId: string) {
    const attempt = await this.prisma.topikExamAttempt.findFirst({
      where: { id: attemptId, userId, finishedAt: { not: null } },
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
        questionIds,
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

    const attempt = await this.prisma.topikExamAttempt.findFirst({
      where: {
        id: dto.attemptId,
        userId,
        examId,
        mode: TopikAttemptMode.FULL_EXAM,
        finishedAt: null,
      },
      include: {
        exam: true,
      },
    });
    if (!attempt || !attempt.exam?.isPublished) {
      throw new NotFoundException('Không tìm thấy phiên thi hoặc đã nộp bài');
    }

    const allowedIds = new Set(attempt.questionIds);
    if (allowedIds.size === 0) {
      throw new BadRequestException('Phiên thi không có câu hỏi');
    }

    for (const answer of dto.answers) {
      if (!allowedIds.has(answer.questionId)) {
        throw new BadRequestException(
          `Câu ${answer.questionId} không thuộc đề thi này`,
        );
      }
    }

    if (dto.answers.length !== allowedIds.size) {
      throw new BadRequestException('Cần trả lời đủ tất cả câu trong đề');
    }

    const questions = await this.prisma.topikQuestion.findMany({
      where: { id: { in: [...allowedIds] } },
    });

    const { graded, correctCount } = gradeTopikAnswers(questions, dto.answers);
    const totalQuestions = dto.answers.length;
    const now = new Date();

    const finished = await this.prisma.topikExamAttempt.update({
      where: { id: attempt.id },
      data: {
        answers: graded,
        correctCount,
        totalQuestions,
        scorePercent: scorePercent(correctCount, totalQuestions),
        finishedAt: now,
      },
    });

    return {
      attemptId: finished.id,
      mode: finished.mode,
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      tier: finished.tier,
      correctCount,
      totalQuestions,
      scorePercent: finished.scorePercent,
      answers: graded,
    };
  }
}
