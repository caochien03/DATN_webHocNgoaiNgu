import { TopikSection, TopikTier } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class TopikAnswerItemDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(0)
  selectedIndex: number;
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
  @IsString()
  attemptId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TopikAnswerItemDto)
  answers: TopikAnswerItemDto[];
}
