import { QuizSourceType } from '@prisma/client';
import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';

export class CreateQuizAttemptDto {
  @IsEnum(QuizSourceType)
  sourceType: QuizSourceType;

  @IsString()
  sourceId: string;

  @IsString()
  sourceTitle: string;

  @IsInt()
  @Min(1)
  totalQuestions: number;

  @IsInt()
  @Min(0)
  correctAnswers: number;

  @IsInt()
  @Min(0)
  @Max(100)
  scorePercent: number;
}
