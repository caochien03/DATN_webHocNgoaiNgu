import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { GrammarLevel } from '@prisma/client';
import { SUPPORTED_LANGUAGES } from '../../../languages/supported-languages';

const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export class CreateLessonDto {
  @IsEnum(GrammarLevel)
  level: GrammarLevel;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsString()
  @IsIn(LANGUAGE_CODES)
  languageCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
