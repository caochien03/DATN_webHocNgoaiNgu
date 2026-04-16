import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
}
