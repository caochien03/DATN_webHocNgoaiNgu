import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GrammarService } from './grammar.service';

@Controller('grammar')
@UseGuards(JwtAuthGuard)
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get('lessons')
  listLessons(@Query('level') level?: string) {
    return this.grammarService.listLessons(level);
  }

  @Get('lessons/:id')
  getLesson(@Param('id') id: string) {
    return this.grammarService.getLesson(id);
  }

  @Get('lessons/:id/exercises')
  listExercises(@Param('id') id: string) {
    return this.grammarService.listExercises(id);
  }
}
