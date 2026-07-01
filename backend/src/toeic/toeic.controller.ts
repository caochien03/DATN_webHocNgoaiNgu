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
import { ToeicSection, ToeicTier } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  SubmitToeicExamDto,
  SubmitToeicPracticeDto,
} from './dto/submit-toeic.dto';
import { ToeicService } from './toeic.service';

@Controller('toeic')
@UseGuards(JwtAuthGuard)
export class ToeicController {
  constructor(private readonly toeicService: ToeicService) {}

  @Get('formats')
  listFormats(
    @Query('tier') tier: ToeicTier = ToeicTier.TOEIC_LR,
    @Query('section') section?: ToeicSection,
  ) {
    return this.toeicService.listFormats(tier, section);
  }

  @Get('exams')
  listExams(@Query('tier') tier?: ToeicTier) {
    return this.toeicService.listExams(tier);
  }

  @Get('exams/:id')
  getExam(@Param('id') id: string) {
    return this.toeicService.getExamForTake(id);
  }

  @Get('practice')
  async practice(
    @Query('tier') tier: ToeicTier = ToeicTier.TOEIC_LR,
    @Query('section') section: ToeicSection,
    @Query('fromNo', ParseIntPipe) fromNo: number,
    @Query('toNo', ParseIntPipe) toNo: number,
    @Query('count') count?: string,
  ) {
    await this.toeicService.getFormatOrThrow(tier, section, fromNo, toNo);
    const parsedCount =
      count !== undefined && count !== '' ? parseInt(count, 10) : undefined;
    const questionCount = this.toeicService.resolvePracticeCount(parsedCount);
    const { questions, requestedCount } =
      await this.toeicService.getPracticeQuestions({
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
    @Body() dto: SubmitToeicPracticeDto,
  ) {
    return this.toeicService.submitPractice(userId, dto);
  }

  @Post('exams/:id/submit')
  submitExam(
    @CurrentUser('id') userId: string,
    @Param('id') examId: string,
    @Body() dto: SubmitToeicExamDto,
  ) {
    return this.toeicService.submitExam(userId, examId, dto);
  }

  @Get('attempts')
  listAttempts(@CurrentUser('id') userId: string) {
    return this.toeicService.listAttempts(userId);
  }

  @Get('attempts/:id')
  getAttempt(
    @CurrentUser('id') userId: string,
    @Param('id') attemptId: string,
  ) {
    return this.toeicService.getAttempt(userId, attemptId);
  }
}
