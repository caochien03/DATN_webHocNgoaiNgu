import { ToeicSection, ToeicTier } from '@prisma/client';
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

export class ToeicAnswerItemDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(0)
  selectedIndex: number;
}

export class SubmitToeicPracticeDto {
  @IsEnum(ToeicTier)
  tier: ToeicTier;

  @IsEnum(ToeicSection)
  section: ToeicSection;

  @IsInt()
  @Min(1)
  fromNo: number;

  @IsInt()
  @Min(1)
  toNo: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ToeicAnswerItemDto)
  answers: ToeicAnswerItemDto[];
}

export class SubmitToeicExamDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ToeicAnswerItemDto)
  answers: ToeicAnswerItemDto[];
}
