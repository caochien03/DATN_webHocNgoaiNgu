import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  frontText: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  backText: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
