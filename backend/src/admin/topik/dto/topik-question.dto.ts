import { TopikQuestionType, TopikSection, TopikTier } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
import { TopikWritingPartInputDto } from './exam-question-input.dto';

export class CreateTopikQuestionDto {
  @IsEnum(TopikTier)
  tier: TopikTier;

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
  @ValidateNested({ each: true })
  @Type(() => TopikWritingPartInputDto)
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

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateTopikQuestionDto {
  @IsOptional()
  @IsEnum(TopikTier)
  tier?: TopikTier;

  @IsOptional()
  @IsEnum(TopikSection)
  section?: TopikSection;

  @IsOptional()
  @IsInt()
  @Min(1)
  questionNo?: number;

  @IsOptional()
  @IsEnum(TopikQuestionType)
  questionType?: TopikQuestionType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  prompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  passage?: string | null;

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
  explanation?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  audioUrl?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @MaxLength(500, { each: true })
  optionImageUrls?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bundleId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  modelAnswer?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopikWritingPartInputDto)
  writingParts?: TopikWritingPartInputDto[] | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  minChars?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxChars?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxScore?: number | null;

  @IsOptional()
  @IsObject()
  rubric?: Record<string, unknown> | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
