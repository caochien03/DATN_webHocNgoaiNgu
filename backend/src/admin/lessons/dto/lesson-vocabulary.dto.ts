import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLessonVocabularyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  frontText: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  backText: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateLessonVocabularyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  frontText?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  backText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
