import { QuizSourceType } from '@prisma/client';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SUPPORTED_LANGUAGES } from '../../languages/supported-languages';

const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export class CreateQuizAttemptDto {
  @IsEnum(QuizSourceType)
  sourceType: QuizSourceType;

  @IsString()
  sourceId: string;

  @IsString()
  sourceTitle: string;

  @IsOptional()
  @IsString()
  @IsIn(LANGUAGE_CODES)
  languageCode?: string;

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
