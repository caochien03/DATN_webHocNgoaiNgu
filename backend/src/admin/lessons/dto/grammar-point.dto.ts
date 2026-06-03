import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGrammarPointDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  meaning?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  structure?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  example?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  translation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateGrammarPointDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  meaning?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  structure?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  example?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  translation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
