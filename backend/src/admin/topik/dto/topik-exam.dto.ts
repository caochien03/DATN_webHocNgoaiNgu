import { TopikTier } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ExamQuestionInputDto } from './exam-question-input.dto';

export class CreateTopikExamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(TopikTier)
  tier: TopikTier;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

/** Tạo đề kèm toàn bộ câu hỏi (POST /admin/topik/exams, import JSON). */
export class CreateTopikExamWithQuestionsDto extends CreateTopikExamDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionInputDto)
  questions: ExamQuestionInputDto[];
}

export class UpdateTopikExamDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsEnum(TopikTier)
  tier?: TopikTier;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  /** Nếu gửi — thay thế toàn bộ câu trong đề. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionInputDto)
  questions?: ExamQuestionInputDto[];
}

export class AddTopikExamQuestionDto {
  @IsString()
  questionId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
