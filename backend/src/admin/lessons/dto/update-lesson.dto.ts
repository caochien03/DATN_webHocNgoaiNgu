import { GrammarLevel } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsEnum(GrammarLevel)
  level?: GrammarLevel;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
