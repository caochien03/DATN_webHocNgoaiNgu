import { IsBoolean } from 'class-validator';

export class AttemptCardDto {
  @IsBoolean()
  isCorrect: boolean;
}
