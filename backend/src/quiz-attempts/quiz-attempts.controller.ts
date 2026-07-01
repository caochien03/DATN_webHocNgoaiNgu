import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { QuizAttemptsService } from './quiz-attempts.service';

@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard)
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.quizAttemptsService.list(userId, languageCode);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateQuizAttemptDto) {
    return this.quizAttemptsService.create(userId, dto);
  }
}
