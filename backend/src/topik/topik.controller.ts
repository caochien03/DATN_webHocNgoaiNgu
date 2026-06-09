import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TopikSection, TopikTier } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
    @Query('limit') limit?: string,
  ) {
    await this.topikService.getFormatOrThrow(tier, section, fromNo, toNo);
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const questions = await this.topikService.getPracticeQuestions({
      tier,
      section,
      fromNo,
      toNo,
      limit: parsedLimit,
    });
    return { tier, section, fromNo, toNo, questions };
  }
}
