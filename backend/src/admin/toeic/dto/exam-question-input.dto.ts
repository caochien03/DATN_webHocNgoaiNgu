import { ToeicSection } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ToeicExamQuestionInputDto {
  @IsInt()
  @Min(0)
  sortOrder: number;

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
}
