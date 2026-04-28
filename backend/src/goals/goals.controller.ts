import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.goalsService.getMe(userId);
  }

  @Patch('me')
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateGoalDto) {
    return this.goalsService.updateMe(userId, dto.dailyCardTarget);
  }

  @Get('me/history')
  getHistory(@CurrentUser('id') userId: string, @Query('days') daysRaw?: string) {
    const parsed = Number(daysRaw);
    const days = Number.isFinite(parsed) ? Math.floor(parsed) : 30;
    return this.goalsService.getHistory(userId, days);
  }
}
