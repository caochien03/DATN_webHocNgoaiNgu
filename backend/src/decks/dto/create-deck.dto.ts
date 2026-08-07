import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SUPPORTED_LANGUAGES } from '../../languages/supported-languages';

const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export class CreateDeckDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(LANGUAGE_CODES)
  languageCode?: string;
}
