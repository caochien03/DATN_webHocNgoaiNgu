import { TopikSection, TopikTier } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class TopikAnswerItemDto {
  @IsString()
  questionId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  selectedIndex?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  textAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  textAnswers?: string[];
}

export class SubmitTopikPracticeDto {
  @IsEnum(TopikTier)
  tier: TopikTier;

  @IsEnum(TopikSection)
  section: TopikSection;

  @IsInt()
  @Min(1)
  fromNo: number;

  @IsInt()
  @Min(1)
  toNo: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TopikAnswerItemDto)
  answers: TopikAnswerItemDto[];
}

export class SubmitTopikExamDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TopikAnswerItemDto)
  answers: TopikAnswerItemDto[];
}
