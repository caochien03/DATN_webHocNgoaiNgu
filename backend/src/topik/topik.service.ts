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
  scorePercentMcqOnly,
  type GradedTopikAnswer,
} from './topik-grading';
import { assertAnswersMatchQuestions } from './topik-answer-validation';
import {
  loadFixedExamQuestions,
  practicePoolQuestionWhere,
  randomQuestionsForPractice,
} from './topik-random';
import { countQuestionsBySection } from './topik-exam-sections';
import { TopikAiGradingService } from './topik-ai-grading.service';
import { summarizeWritingFromAnswers } from './topik-writing-summary';

const PRACTICE_COUNT_DEFAULT = 10;
const PRACTICE_COUNT_MAX = 50;

@Injectable()
export class TopikService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiGrading: TopikAiGradingService,
  ) {}

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
      include: { _count: { select: { questions: true } } },
    });
    return exams.map(({ _count, ...exam }) => ({
      ...exam,
      questionCount: _count.questions,
    }));
  }

  async getExamForTake(examId: string) {
    const exam = await this.prisma.topikExam.findFirst({
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

  async listAttempts(userId: string) {
    const rows = await this.prisma.topikExamAttempt.findMany({
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
      take: 100,
      include: {
        exam: { select: { id: true, title: true } },
      },
    });

    return rows.map(({ answers, ...row }) => ({
      ...row,
      writingSummary: summarizeWritingFromAnswers(answers),
    }));
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
    return this.shapeAttemptResponse(attempt);
  }

  async regradeAttemptWriting(userId: string, attemptId: string) {
    if (!this.aiGrading.enabled) {
      throw new BadRequestException(
        'Chưa cấu hình Gemini trên server — không thể chấm lại.',
      );
    }

    const attempt = await this.prisma.topikExamAttempt.findFirst({
      where: { id: attemptId, userId, finishedAt: { not: null } },
      include: {
        exam: { select: { id: true, title: true } },
      },
    });
    if (!attempt) {
      throw new NotFoundException('Không tìm thấy bài làm');
    }

    const graded = attempt.answers as unknown as GradedTopikAnswer[];
    if (!Array.isArray(graded)) {
      throw new BadRequestException('Dữ liệu bài làm không hợp lệ');
    }

    const pendingCount = graded.filter((a) => a.gradeStatus === 'pending').length;
    if (pendingCount === 0) {
      throw new BadRequestException('Không có câu viết nào đang chờ chấm');
    }

    const questionIds =
      attempt.questionIds.length > 0
        ? attempt.questionIds
        : graded.map((a) => a.questionId);
    const questions = await this.prisma.topikQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    await this.aiGrading.gradeWritingAnswers(graded, questions);

    const stillPending = graded.filter((a) => a.gradeStatus === 'pending').length;
    const regradedCount = pendingCount - stillPending;

    const updated = await this.prisma.topikExamAttempt.update({
      where: { id: attemptId },
      data: { answers: graded },
      include: {
        exam: { select: { id: true, title: true } },
      },
    });

    return {
      ...this.shapeAttemptResponse(updated),
      regradedCount,
      stillPendingCount: stillPending,
    };
  }

  private shapeAttemptResponse<
    T extends { answers: unknown },
  >(attempt: T) {
    const { answers, ...row } = attempt;
    return {
      ...row,
      answers,
      writingSummary: summarizeWritingFromAnswers(answers),
    };
  }

  async submitPractice(userId: string, dto: SubmitTopikPracticeDto) {
    if (dto.fromNo > dto.toNo) {
      throw new BadRequestException('fromNo must be <= toNo');
    }
    await this.getFormatOrThrow(dto.tier, dto.section, dto.fromNo, dto.toNo);
    assertUniqueAnswers(dto.answers);
    const questionIds = dto.answers.map((a) => a.questionId);
    const questions = await this.prisma.topikQuestion.findMany({
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

    const { graded } = gradeTopikAnswers(questions, dto.answers);
    await this.aiGrading.gradeWritingAnswers(graded, questions);
    const mcqScore = scorePercentMcqOnly(graded);
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
        correctCount: mcqScore.correctCount,
        totalQuestions,
        scorePercent:
          mcqScore.totalMcq > 0 ? mcqScore.scorePercent : 0,
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
      correctCount: mcqScore.correctCount,
      totalQuestions,
      scorePercent: attempt.scorePercent,
      answers: graded,
    };
  }

  async submitExam(userId: string, examId: string, dto: SubmitTopikExamDto) {
    assertUniqueAnswers(dto.answers);

    const exam = await this.prisma.topikExam.findFirst({
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

    const questions = await this.prisma.topikQuestion.findMany({
      where: { id: { in: [...allowedIds] } },
    });

    assertAnswersMatchQuestions(questions, dto.answers);
    const { graded } = gradeTopikAnswers(questions, dto.answers);
    await this.aiGrading.gradeWritingAnswers(graded, questions);
    const mcqScore = scorePercentMcqOnly(graded);
    const totalQuestions = dto.answers.length;
    const now = new Date();

    const attempt = await this.prisma.topikExamAttempt.create({
      data: {
        userId,
        mode: TopikAttemptMode.FULL_EXAM,
        examId: exam.id,
        tier: exam.tier,
        questionIds: examQuestions.map((q) => q.id),
        answers: graded,
        correctCount: mcqScore.correctCount,
        totalQuestions,
        scorePercent:
          mcqScore.totalMcq > 0 ? mcqScore.scorePercent : 0,
        finishedAt: now,
      },
    });

    return {
      attemptId: attempt.id,
      mode: attempt.mode,
      examId: exam.id,
      examTitle: exam.title,
      tier: attempt.tier,
      correctCount: mcqScore.correctCount,
      totalQuestions,
      scorePercent: attempt.scorePercent,
      answers: graded,
    };
  }
}
