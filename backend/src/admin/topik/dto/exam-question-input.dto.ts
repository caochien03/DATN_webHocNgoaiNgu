import { TopikSection } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  IsEnum,
} from 'class-validator';

export class ExamQuestionInputDto {
  @IsInt()
  @Min(0)
  sortOrder: number;

  @IsEnum(TopikSection)
  section: TopikSection;

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
  @ArrayMinSize(2)
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
