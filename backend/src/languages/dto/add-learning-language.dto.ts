import { IsIn, IsString } from 'class-validator';
import { SUPPORTED_LANGUAGES } from '../supported-languages';

const CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export class AddLearningLanguageDto {
  @IsString()
  @IsIn(CODES)
  languageCode!: string;
}
