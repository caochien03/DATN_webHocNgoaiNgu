import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ko', 'en'])
  languageCode?: string;

  @IsOptional()
  @IsString()
  targetPathId?: string;
}

export class JoinGroupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(12)
  inviteCode: string;
}

export class AddGroupCardDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  term: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(400)
  meaning: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  example?: string;
}

export class UpdateGroupSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  targetPathId?: string;
}
