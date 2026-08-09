import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name?: string;
    role?: UserRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        ...(data.role !== undefined && { role: data.role }),
      },
    });
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      avatarUrl?: string | null;
      avatarFrame?: string;
      bio?: string | null;
      targetGoal?: string | null;
      currentLevel?: string | null;
    },
  ): Promise<Omit<User, 'passwordHash'>> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.avatarUrl !== undefined) payload.avatarUrl = data.avatarUrl;
    if (data.avatarFrame !== undefined) payload.avatarFrame = data.avatarFrame;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.targetGoal !== undefined) payload.targetGoal = data.targetGoal;
    if (data.currentLevel !== undefined)
      payload.currentLevel = data.currentLevel;

    if (Object.keys(payload).length === 0) {
      const existing = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existing) {
        throw new NotFoundException('User not found');
      }
      return this.toPublic(existing);
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: payload,
    });
    const { passwordHash, ...safe } = user;
    void passwordHash;
    return safe;
  }

  async getUnlockedFrames(userId: string) {
    // Tính streak: đếm ngày liên tiếp gần nhất có goalAchieved = true
    const dailyProgress = await this.prisma.userDailyProgress.findMany({
      where: { userId },
      select: { date: true, reviewedCards: true, goalAchieved: true },
      orderBy: { date: 'desc' },
    });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const d of dailyProgress) {
      const diff = Math.round(
        (today.getTime() - new Date(d.date).getTime()) / 86400000,
      );
      if (diff === streak && d.goalAchieved) {
        streak++;
      } else if (diff > streak) {
        break;
      }
    }

    // Tính tổng XP: mỗi thẻ ôn tập = 1 XP
    const totalXP = dailyProgress.reduce((sum, d) => sum + d.reviewedCards, 0);

    // Kiểm tra hoàn thành lộ trình
    const pathProgress = await this.prisma.userPathProgress.findMany({
      where: { userId },
      include: {
        path: { select: { steps: { select: { id: true } } } },
      },
    });
    const completedAnyPath = pathProgress.some(
      (p) =>
        p.completedStepIds.length >= p.path.steps.length &&
        p.path.steps.length > 0,
    );

    const frames = [
      {
        id: 'DEFAULT',
        name: '🌿 Mầm Non',
        description: 'Viền bo tròn thanh lịch',
        unlocked: true,
        condition: 'Mặc định mở cho mọi học viên',
      },
      {
        id: 'FIRE_STREAK',
        name: '🔥 Lửa Chăm Chỉ',
        description: 'Viền cam ánh lửa gradient chuyển động',
        unlocked: streak >= 7,
        condition: `Đạt chuỗi Streak ≥ 7 ngày (hiện tại: ${streak} ngày)`,
      },
      {
        id: 'DIAMOND_XP',
        name: '💎 Kim Cương Tinh Anh',
        description: 'Viền xanh lam kim cương lấp lánh',
        unlocked: totalXP >= 1000,
        condition: `Đạt tổng ≥ 1.000 XP (hiện tại: ${totalXP} XP)`,
      },
      {
        id: 'ROYAL_CROWN',
        name: '👑 Vương Miện Hoàng Gia',
        description: 'Viền vàng ánh kim + icon vương miện',
        unlocked: completedAnyPath,
        condition: `Hoàn thành ít nhất 1 lộ trình (${completedAnyPath ? 'Đã đạt' : 'Chưa đạt'})`,
      },
    ];

    return { frames, stats: { streak, totalXP, completedAnyPath } };
  }

  toPublic(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...safe } = user;
    void passwordHash;
    return safe;
  }
}
