import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TopikSection, TopikTier } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  SubmitTopikExamDto,
  SubmitTopikPracticeDto,
} from './dto/submit-topik.dto';
import { TopikService } from './topik.service';

@Controller('topik')
@UseGuards(JwtAuthGuard)
export class TopikController {
  constructor(private readonly topikService: TopikService) {}

  @Get('formats')
  listFormats(
    @Query('tier') tier: TopikTier = TopikTier.TOPIK_I,
    @Query('section') section?: TopikSection,
  ) {
    return this.topikService.listFormats(tier, section);
  }

  @Get('exams')
  listExams(@Query('tier') tier?: TopikTier) {
    return this.topikService.listExams(tier);
  }

  @Get('exams/:id')
  getExam(@Param('id') id: string) {
    return this.topikService.getExamForTake(id);
  }

  @Get('practice')
  async practice(
    @Query('tier') tier: TopikTier = TopikTier.TOPIK_I,
    @Query('section') section: TopikSection,
    @Query('fromNo', ParseIntPipe) fromNo: number,
    @Query('toNo', ParseIntPipe) toNo: number,
    @Query('count') count?: string,
  ) {
    await this.topikService.getFormatOrThrow(tier, section, fromNo, toNo);
    const parsedCount =
      count !== undefined && count !== '' ? parseInt(count, 10) : undefined;
    const questionCount = this.topikService.resolvePracticeCount(parsedCount);
    const { questions, requestedCount } =
      await this.topikService.getPracticeQuestions({
        tier,
        section,
        fromNo,
        toNo,
        count: questionCount,
      });
    return {
      tier,
      section,
      fromNo,
      toNo,
      requestedCount,
      count: questions.length,
      questions,
    };
  }

  @Post('practice/submit')
  submitPractice(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitTopikPracticeDto,
  ) {
    return this.topikService.submitPractice(userId, dto);
  }

  @Post('exams/:id/submit')
  submitExam(
    @CurrentUser('id') userId: string,
    @Param('id') examId: string,
    @Body() dto: SubmitTopikExamDto,
  ) {
    return this.topikService.submitExam(userId, examId, dto);
  }

  @Get('attempts')
  listAttempts(@CurrentUser('id') userId: string) {
    return this.topikService.listAttempts(userId);
  }

  @Get('attempts/:id')
  getAttempt(
    @CurrentUser('id') userId: string,
    @Param('id') attemptId: string,
  ) {
    return this.topikService.getAttempt(userId, attemptId);
  }
}
