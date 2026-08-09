import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  /** URL ảnh đại diện; để rỗng nếu muốn xóa (backend sẽ lưu null). */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string;

  /** Mã khung avatar: DEFAULT | FIRE_STREAK | DIAMOND_XP | ROYAL_CROWN */
  @IsOptional()
  @IsString()
  @IsIn(['DEFAULT', 'FIRE_STREAK', 'DIAMOND_XP', 'ROYAL_CROWN'])
  avatarFrame?: string;

  /** Châm ngôn / tiểu sử ngắn (tối đa 150 ký tự). */
  @IsOptional()
  @IsString()
  @MaxLength(150)
  bio?: string;

  /** Mục tiêu học tập chính. */
  @IsOptional()
  @IsString()
  @IsIn(['topik', 'toeic', 'study_abroad', 'work', 'hobby', 'other'])
  targetGoal?: string;

  /** Trình độ hiện tại. */
  @IsOptional()
  @IsString()
  @IsIn(['beginner', 'elementary', 'intermediate', 'advanced'])
  currentLevel?: string;
}
