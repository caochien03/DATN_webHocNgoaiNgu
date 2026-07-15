import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SpeakingSelfLevel } from '@prisma/client';

export class SpeakingGoalItemDto {
  @IsString()
  key: string;

  @IsString()
  labelVi: string;

  @IsBoolean()
  required: boolean;
}

// ─── Topic DTOs ──────────────────────────────────────────────────────────────

export class CreateSpeakingTopicDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  titleNative?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateSpeakingTopicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  titleNative?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

// ─── Situation DTOs ───────────────────────────────────────────────────────────

export class CreateSpeakingSituationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  topicId?: string;

  @IsString()
  languageCode: string;

  @IsOptional()
  @IsEnum(SpeakingSelfLevel)
  level?: SpeakingSelfLevel;

  @IsString()
  contextVi: string;

  @IsString()
  userRoleVi: string;

  @IsString()
  npcRoleVi: string;

  @IsString()
  openingLine: string;

  @IsString()
  systemPrompt: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeakingGoalItemDto)
  goals?: SpeakingGoalItemDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUserTurns?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateSpeakingSituationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  topicId?: string;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsEnum(SpeakingSelfLevel)
  level?: SpeakingSelfLevel;

  @IsOptional()
  @IsString()
  contextVi?: string;

  @IsOptional()
  @IsString()
  userRoleVi?: string;

  @IsOptional()
  @IsString()
  npcRoleVi?: string;

  @IsOptional()
  @IsString()
  openingLine?: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeakingGoalItemDto)
  goals?: SpeakingGoalItemDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUserTurns?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
