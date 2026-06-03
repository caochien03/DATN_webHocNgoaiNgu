import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGrammarExerciseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  prompt: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  options: string[];

  @IsInt()
  @Min(0)
  correctIndex: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explanation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateGrammarExerciseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  prompt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  options?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  correctIndex?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explanation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
