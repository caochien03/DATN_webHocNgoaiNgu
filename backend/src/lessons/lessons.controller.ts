import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LessonsService } from './lessons.service';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  list(
    @Query('level') level?: string,
    @Query('languageCode') languageCode?: string,
    @Query('language') language?: string,
  ) {
    return this.lessonsService.list(level, languageCode ?? language);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.lessonsService.get(id);
  }

  @Get(':id/exercises')
  listExercises(@Param('id') id: string) {
    return this.lessonsService.listExercises(id);
  }
}
