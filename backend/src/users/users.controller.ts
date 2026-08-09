import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProgressService } from './progress.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly progressService: ProgressService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: Omit<User, 'passwordHash'>) {
    return user;
  }

  @Get('me/progress')
  @UseGuards(JwtAuthGuard)
  progress(
    @CurrentUser('id') userId: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.progressService.getForLanguage(userId, languageCode);
  }

  @Get('me/unlocked-frames')
  @UseGuards(JwtAuthGuard)
  getUnlockedFrames(@CurrentUser('id') userId: string) {
    return this.usersService.getUnlockedFrames(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.avatarUrl !== undefined && {
        avatarUrl: dto.avatarUrl === '' ? null : dto.avatarUrl,
      }),
      ...(dto.avatarFrame !== undefined && { avatarFrame: dto.avatarFrame }),
      ...(dto.bio !== undefined && { bio: dto.bio === '' ? null : dto.bio }),
      ...(dto.targetGoal !== undefined && {
        targetGoal: dto.targetGoal === '' ? null : dto.targetGoal,
      }),
      ...(dto.currentLevel !== undefined && {
        currentLevel: dto.currentLevel === '' ? null : dto.currentLevel,
      }),
    });
  }
}
