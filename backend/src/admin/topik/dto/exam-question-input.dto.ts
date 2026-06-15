import { TopikQuestionType, TopikSection } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class TopikWritingPartInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  modelAnswer?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxScore?: number;
}

export class ExamQuestionInputDto {
  @IsInt()
  @Min(0)
  sortOrder: number;

  @IsEnum(TopikSection)
  section: TopikSection;

  @IsInt()
  @Min(1)
  questionNo: number;

  @IsOptional()
  @IsEnum(TopikQuestionType)
  questionType?: TopikQuestionType;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  prompt: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  passage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  options?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  correctIndex?: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  explanation?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  audioUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @MaxLength(500, { each: true })
  optionImageUrls?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bundleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  modelAnswer?: string;

  @IsOptional()
  @IsArray()
  writingParts?: TopikWritingPartInputDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  minChars?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxChars?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxScore?: number;

  @IsOptional()
  @IsObject()
  rubric?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;
}
