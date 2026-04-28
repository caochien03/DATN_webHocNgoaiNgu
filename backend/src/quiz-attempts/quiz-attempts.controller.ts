import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { QuizAttemptsService } from './quiz-attempts.service';

@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard)
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.quizAttemptsService.list(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateQuizAttemptDto) {
    return this.quizAttemptsService.create(userId, dto);
  }
}
