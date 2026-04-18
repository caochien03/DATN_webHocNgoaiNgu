import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  frontText?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  backText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  note?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
