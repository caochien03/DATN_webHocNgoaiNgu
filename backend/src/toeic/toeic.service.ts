import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ToeicAttemptMode, ToeicSection, ToeicTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubmitToeicExamDto,
  SubmitToeicPracticeDto,
} from './dto/submit-toeic.dto';
import {
  assertUniqueAnswers,
  gradeToeicAnswers,
  scorePercent,
} from './toeic-grading';
import { assertAnswersMatchQuestions } from './toeic-answer-validation';
import {
  loadFixedExamQuestions,
  practicePoolQuestionWhere,
  randomQuestionsForPractice,
} from './toeic-random';
import { countQuestionsBySection } from './toeic-exam-sections';

const PRACTICE_COUNT_DEFAULT = 10;
const PRACTICE_COUNT_MAX = 50;

@Injectable()
export class ToeicService {
  constructor(private readonly prisma: PrismaService) {}

  listFormats(tier: ToeicTier, section?: ToeicSection) {
    return this.prisma.toeicQuestionFormat.findMany({
      where: {
        tier,
        ...(section && { section }),
      },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async listExams(tier?: ToeicTier) {
    const exams = await this.prisma.toeicExam.findMany({
      where: {
        isPublished: true,
        ...(tier && { tier }),
      },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { questions: true } } },
    });
    return exams.map(({ _count, ...exam }) => ({
      ...exam,
      questionCount: _count.questions,
    }));
  }

  async getExamForTake(examId: string) {
    const exam = await this.prisma.toeicExam.findFirst({
      where: { id: examId, isPublished: true },
    });
    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');

    const questions = await loadFixedExamQuestions(this.prisma, exam.id);
    if (questions.length === 0) {
      throw new BadRequestException('Đề thi chưa có câu hỏi');
    }

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      tier: exam.tier,
      durationMinutes: exam.durationMinutes,
      questionCount: questions.length,
      sectionCounts: countQuestionsBySection(questions),
      questions,
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
    tier: ToeicTier;
    section: ToeicSection;
    fromNo: number;
    toNo: number;
    count?: number;
  }) {
    const count = this.resolvePracticeCount(params.count);
    return randomQuestionsForPractice(this.prisma, { ...params, count });
  }

  async getFormatOrThrow(
    tier: ToeicTier,
    section: ToeicSection,
    fromNo: number,
    toNo: number,
  ) {
    const format = await this.prisma.toeicQuestionFormat.findFirst({
      where: { tier, section, fromNo, toNo },
    });
    if (!format) {
      throw new NotFoundException('Không tìm thấy dạng bài');
    }
    return format;
  }

  async listAttempts(userId: string) {
    return this.prisma.toeicExamAttempt.findMany({
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
      take: 100,
      include: {
        exam: { select: { id: true, title: true } },
      },
    });
  }

  async getAttempt(userId: string, attemptId: string) {
    const attempt = await this.prisma.toeicExamAttempt.findFirst({
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

  async submitPractice(userId: string, dto: SubmitToeicPracticeDto) {
    if (dto.fromNo > dto.toNo) {
      throw new BadRequestException('fromNo must be <= toNo');
    }
    await this.getFormatOrThrow(dto.tier, dto.section, dto.fromNo, dto.toNo);
    assertUniqueAnswers(dto.answers);
    const questionIds = dto.answers.map((a) => a.questionId);
    const questions = await this.prisma.toeicQuestion.findMany({
      where: practicePoolQuestionWhere({
        tier: dto.tier,
        section: dto.section,
        fromNo: dto.fromNo,
        toNo: dto.toNo,
        questionIds,
      }),
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestException(
        'Một hoặc nhiều câu không hợp lệ cho dạng bài này',
      );
    }

    assertAnswersMatchQuestions(questions, dto.answers);

    const { graded, correctCount } = gradeToeicAnswers(questions, dto.answers);
    const totalQuestions = dto.answers.length;
    const now = new Date();

    const attempt = await this.prisma.toeicExamAttempt.create({
      data: {
        userId,
        mode: ToeicAttemptMode.PRACTICE,
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

  async submitExam(userId: string, examId: string, dto: SubmitToeicExamDto) {
    assertUniqueAnswers(dto.answers);

    const exam = await this.prisma.toeicExam.findFirst({
      where: { id: examId, isPublished: true },
    });
    if (!exam) {
      throw new NotFoundException('Không tìm thấy đề thi');
    }

    const examQuestions = await loadFixedExamQuestions(this.prisma, examId);
    if (examQuestions.length === 0) {
      throw new BadRequestException('Đề thi chưa có câu hỏi');
    }

    const allowedIds = new Set(examQuestions.map((q) => q.id));

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

    const questions = await this.prisma.toeicQuestion.findMany({
      where: { id: { in: [...allowedIds] } },
    });

    assertAnswersMatchQuestions(questions, dto.answers);
    const { graded, correctCount } = gradeToeicAnswers(questions, dto.answers);
    const totalQuestions = dto.answers.length;
    const now = new Date();

    const attempt = await this.prisma.toeicExamAttempt.create({
      data: {
        userId,
        mode: ToeicAttemptMode.FULL_EXAM,
        examId: exam.id,
        tier: exam.tier,
        questionIds: examQuestions.map((q) => q.id),
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
