import { SpeakingSelfLevel } from '@prisma/client';
import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';

export class CreateSpeakingSessionDto {
  @IsString()
  situationId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  selectedTopicIds: string[];

  @IsEnum(SpeakingSelfLevel)
  selfLevel: SpeakingSelfLevel;
}
