import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TopicsService } from './topics.service';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  list(
    @Query('language') language?: string,
    @Query('level') level?: string,
  ) {
    return this.topicsService.list({ language, level });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.topicsService.get(id);
  }
}
