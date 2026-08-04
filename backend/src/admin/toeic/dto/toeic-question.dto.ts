import { ToeicSection, ToeicTier } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateToeicQuestionDto {
  @IsEnum(ToeicTier)
  tier: ToeicTier;

  @IsEnum(ToeicSection)
  section: ToeicSection;

  @IsInt()
  @Min(1)
  questionNo: number;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  prompt: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  passage?: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  options: string[];

  @IsInt()
  @Min(0)
  correctIndex: number;

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
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateToeicQuestionDto {
  @IsOptional()
  @IsEnum(ToeicTier)
  tier?: ToeicTier;

  @IsOptional()
  @IsEnum(ToeicSection)
  section?: ToeicSection;

  @IsOptional()
  @IsInt()
  @Min(1)
  questionNo?: number;

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
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
