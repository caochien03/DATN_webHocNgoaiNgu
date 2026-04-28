import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DecksService } from './decks.service';

@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly decksService: DecksService) {}

  @Get('today/summary')
  summary(@CurrentUser('id') userId: string) {
    return this.decksService.getReviewTodaySummary(userId);
  }

  @Get('today')
  today(@CurrentUser('id') userId: string, @Query('limit') limitRaw?: string) {
    const parsed = Number(limitRaw);
    const limit = Number.isFinite(parsed) ? Math.floor(parsed) : 20;
    return this.decksService.listReviewToday(userId, limit);
  }
}
