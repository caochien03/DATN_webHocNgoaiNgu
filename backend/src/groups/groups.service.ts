import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityType, GroupRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddGroupCardDto,
  CreateGroupDto,
  JoinGroupDto,
} from './dto/groups.dto';

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private generateInviteCode(lang: string = 'ko'): string {
    const prefix = lang === 'en' ? 'ENG' : 'KOR';
    const num = Math.floor(100 + Math.random() * 900); // 3 digits
    return `${prefix}${num}`;
  }

  async createGroup(userId: string, dto: CreateGroupDto) {
    const lang = dto.languageCode ?? 'ko';

    // Kiểm tra xem user đã ở trong 1 nhóm của ngôn ngữ này chưa
    const existingMembership = await this.prisma.studyGroupMember.findFirst({
      where: {
        userId,
        group: { languageCode: lang },
      },
      include: { group: true },
    });

    if (existingMembership) {
      throw new BadRequestException(
        `Bạn đã tham gia nhóm "${existingMembership.group.name}" cho ngôn ngữ này rồi. Vui lòng rời nhóm cũ trước khi tạo nhóm mới.`,
      );
    }

    // Sinh invite code duy nhất
    let code = this.generateInviteCode(lang);
    let attempts = 0;
    while (attempts < 10) {
      const dup = await this.prisma.studyGroup.findUnique({
        where: { inviteCode: code },
      });
      if (!dup) break;
      code = this.generateInviteCode(lang);
      attempts++;
    }

    const group = await this.prisma.studyGroup.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        avatarUrl: dto.avatarUrl,
        languageCode: lang,
        inviteCode: code,
        targetPathId: dto.targetPathId,
        createdById: userId,
        members: {
          create: {
            userId,
            role: GroupRole.LEADER,
            weeklyXp: 50, // Thưởng 50 XP khởi đầu nhóm
            totalXp: 50,
          },
        },
        activities: {
          create: {
            userId,
            type: ActivityType.JOINED_GROUP,
            metadata: { message: 'Đã tạo nhóm học tập mới!' },
          },
        },
      },
      include: {
        members: true,
      },
    });

    return group;
  }

  async joinGroup(userId: string, dto: JoinGroupDto) {
    const code = dto.inviteCode.trim().toUpperCase();
    const group = await this.prisma.studyGroup.findUnique({
      where: { inviteCode: code },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm với mã mời này');
    }

    const alreadyInThisGroup = group.members.some((m) => m.userId === userId);
    if (alreadyInThisGroup) {
      throw new BadRequestException('Bạn đã là thành viên của nhóm này rồi');
    }

    // Kiểm tra xem user đã ở trong nhóm khác cùng ngôn ngữ chưa
    const otherGroup = await this.prisma.studyGroupMember.findFirst({
      where: {
        userId,
        group: { languageCode: group.languageCode },
      },
    });
    if (otherGroup) {
      throw new BadRequestException(
        'Bạn đang tham gia một nhóm học khác. Vui lòng rời nhóm cũ trước khi gia nhập nhóm mới.',
      );
    }

    if (group.members.length >= group.maxMembers) {
      throw new BadRequestException(
        `Nhóm đã đủ sĩ số tối đa (${group.maxMembers} thành viên)`,
      );
    }

    const member = await this.prisma.studyGroupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: GroupRole.MEMBER,
        weeklyXp: 20,
        totalXp: 20,
      },
    });

    await this.prisma.groupActivity.create({
      data: {
        groupId: group.id,
        userId,
        type: ActivityType.JOINED_GROUP,
        metadata: { message: 'Đã gia nhập nhóm học tập!' },
      },
    });

    return member;
  }

  async getMyGroup(userId: string, languageCode?: string) {
    const membership = await this.prisma.studyGroupMember.findFirst({
      where: {
        userId,
        ...(languageCode && { group: { languageCode } }),
      },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    avatarFrame: true,
                    bio: true,
                    currentLevel: true,
                  },
                },
              },
              orderBy: { weeklyXp: 'desc' },
            },
            activities: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    avatarFrame: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
            _count: {
              select: { cards: true },
            },
          },
        },
      },
    });

    if (!membership) {
      return null;
    }

    const group = membership.group;

    // Lấy tiến độ mục tiêu ngày của các thành viên hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const memberUserIds = group.members.map((m) => m.userId);
    const dailyProgressList = await this.prisma.userDailyProgress.findMany({
      where: {
        userId: { in: memberUserIds },
        languageCode: group.languageCode,
        date: { gte: today },
      },
    });

    const progressMap = new Map(dailyProgressList.map((p) => [p.userId, p]));

    // Lấy tiến độ lộ trình (nếu nhóm có targetPathId)
    let targetPathInfo: {
      id: string;
      title: string;
      totalSteps: number;
      steps: { id: string; title: string; sortOrder: number; type: string }[];
    } | null = null;
    const pathProgressMap = new Map<
      string,
      { completedCount: number; completedStepIds: string[] }
    >();

    if (group.targetPathId) {
      const path = await this.prisma.learningPath.findUnique({
        where: { id: group.targetPathId },
        include: {
          steps: {
            select: { id: true, title: true, sortOrder: true, type: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      if (path) {
        targetPathInfo = {
          id: path.id,
          title: path.title,
          totalSteps: path.steps.length,
          steps: path.steps,
        };

        const pathProgresses = await this.prisma.userPathProgress.findMany({
          where: {
            pathId: group.targetPathId,
            userId: { in: memberUserIds },
          },
        });
        for (const pp of pathProgresses) {
          pathProgressMap.set(pp.userId, {
            completedCount: pp.completedStepIds.length,
            completedStepIds: pp.completedStepIds,
          });
        }
      }
    }

    // Ghép dữ liệu thành viên sinh động
    const enhancedMembers = group.members.map((m, idx) => {
      const dp = progressMap.get(m.userId);
      const memberPathData = pathProgressMap.get(m.userId);
      const completedSteps = memberPathData?.completedCount ?? 0;
      const completedStepIds = memberPathData?.completedStepIds ?? [];

      return {
        id: m.id,
        userId: m.userId,
        role: m.role,
        weeklyXp: m.weeklyXp,
        totalXp: m.totalXp,
        rank: idx + 1,
        user: m.user,
        todayProgress: {
          reviewedCards: dp?.reviewedCards ?? 0,
          goalTarget: dp?.goalTarget ?? 20,
          goalAchieved: dp?.goalAchieved ?? false,
        },
        pathProgress: targetPathInfo
          ? {
              completedSteps,
              completedStepIds,
              totalSteps: targetPathInfo.totalSteps,
              percent:
                targetPathInfo.totalSteps > 0
                  ? Math.round(
                      (completedSteps / targetPathInfo.totalSteps) * 100,
                    )
                  : 0,
            }
          : null,
      };
    });

    // Tính Squad Energy Bar
    const completedCount = enhancedMembers.filter(
      (m) => m.todayProgress.goalAchieved,
    ).length;
    const totalMembers = enhancedMembers.length;
    const energyPercent =
      totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0;
    const isFullSquadDay = completedCount === totalMembers && totalMembers > 0;

    // Tính Total Squad XP & Milestone Chests
    const totalSquadXp = enhancedMembers.reduce((sum, m) => sum + m.totalXp, 0);
    const milestones = [
      {
        id: 'BRONZE',
        targetXp: 100,
        name: '🥉 Rương Đồng',
        perk: 'Mở khóa Danh Hiệu Khởi Động',
        unlocked: totalSquadXp >= 100,
      },
      {
        id: 'SILVER',
        targetXp: 300,
        name: '🥈 Rương Bạc',
        perk: 'Thưởng +20 XP cho tất cả thành viên',
        unlocked: totalSquadXp >= 300,
      },
      {
        id: 'GOLD',
        targetXp: 600,
        name: '🥇 Rương Vàng',
        perk: 'Mở khóa Danh Hiệu Đồng Đội Vàng',
        unlocked: totalSquadXp >= 600,
      },
      {
        id: 'DIAMOND',
        targetXp: 1000,
        name: '💎 Rương Kim Cương',
        perk: 'Mở khóa Vinh Danh Tinh Anh',
        unlocked: totalSquadXp >= 1000,
      },
    ];

    // Cổ vũ đồng đội
    let cheerNotice: {
      memberName: string;
      step: number;
      total: number;
      message: string;
    } | null = null;
    if (targetPathInfo && enhancedMembers.length > 1) {
      const sorted = [...enhancedMembers].sort(
        (a, b) =>
          (a.pathProgress?.completedSteps ?? 0) -
          (b.pathProgress?.completedSteps ?? 0),
      );
      const lowest = sorted[0];
      const highest = sorted[sorted.length - 1];
      if (
        lowest &&
        highest &&
        (lowest.pathProgress?.completedSteps ?? 0) <
          (highest.pathProgress?.completedSteps ?? 0)
      ) {
        const name = lowest.user.name || lowest.user.email;
        cheerNotice = {
          memberName: name,
          step: lowest.pathProgress?.completedSteps ?? 0,
          total: targetPathInfo.totalSteps,
          message: `Cả nhóm hãy cổ vũ bạn ${name} tăng tốc vượt chặng nhé! 🚀`,
        };
      }
    }

    return {
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        avatarUrl: group.avatarUrl,
        languageCode: group.languageCode,
        inviteCode: group.inviteCode,
        maxMembers: group.maxMembers,
        memberCount: totalMembers,
        createdById: group.createdById,
        createdAt: group.createdAt,
        targetPath: targetPathInfo,
        cardsCount: group._count.cards,
      },
      currentMemberRole: membership.role,
      energy: {
        completedCount,
        totalMembers,
        percent: energyPercent,
        isFullSquadDay,
        streakDays: group.squadStreak + (isFullSquadDay ? 1 : 0),
      },
      milestones: {
        totalSquadXp,
        list: milestones,
      },
      cheerNotice,
      leaderboard: enhancedMembers,
      activities: group.activities,
    };
  }

  async updateSettings(
    userId: string,
    dto: {
      name?: string;
      description?: string;
      avatarUrl?: string;
      targetPathId?: string;
    },
    languageCode?: string,
  ) {
    const membership = await this.prisma.studyGroupMember.findFirst({
      where: {
        userId,
        ...(languageCode && { group: { languageCode } }),
      },
      include: { group: true },
    });

    if (!membership) {
      throw new NotFoundException('Bạn không ở trong nhóm nào');
    }

    if (membership.role !== GroupRole.LEADER) {
      throw new ForbiddenException(
        'Chỉ Trưởng nhóm mới có quyền thay đổi cài đặt nhóm',
      );
    }

    if (dto.targetPathId) {
      const path = await this.prisma.learningPath.findUnique({
        where: { id: dto.targetPathId },
      });
      if (!path) {
        throw new BadRequestException('Lộ trình được chọn không tồn tại');
      }
    }

    const updated = await this.prisma.studyGroup.update({
      where: { id: membership.groupId },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim() || null,
        }),
        ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
        ...(dto.targetPathId !== undefined && {
          targetPathId: dto.targetPathId || null,
        }),
      },
    });

    return updated;
  }

  async addCard(userId: string, dto: AddGroupCardDto) {
    const membership = await this.prisma.studyGroupMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new ForbiddenException('Bạn chưa tham gia nhóm học tập nào');
    }

    const card = await this.prisma.groupCard.create({
      data: {
        groupId: membership.groupId,
        createdById: userId,
        term: dto.term.trim(),
        meaning: dto.meaning.trim(),
        example: dto.example?.trim(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Thưởng 10 XP cho thành viên
    await this.prisma.studyGroupMember.update({
      where: { id: membership.id },
      data: {
        weeklyXp: { increment: 10 },
        totalXp: { increment: 10 },
      },
    });

    // Ghi activity
    await this.prisma.groupActivity.create({
      data: {
        groupId: membership.groupId,
        userId,
        type: ActivityType.ADDED_CARD,
        metadata: { term: dto.term.trim(), meaning: dto.meaning.trim() },
      },
    });

    return card;
  }

  async getGroupCards(userId: string) {
    const membership = await this.prisma.studyGroupMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new ForbiddenException('Bạn chưa tham gia nhóm học tập nào');
    }

    return this.prisma.groupCard.findMany({
      where: { groupId: membership.groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            avatarFrame: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await this.prisma.groupCard.findUnique({
      where: { id: cardId },
    });
    if (!card) {
      throw new NotFoundException('Thẻ từ vựng không tồn tại');
    }

    const membership = await this.prisma.studyGroupMember.findFirst({
      where: { userId, groupId: card.groupId },
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền xóa thẻ này');
    }

    if (card.createdById !== userId && membership.role !== GroupRole.LEADER) {
      throw new ForbiddenException(
        'Chỉ người thêm thẻ hoặc Trưởng nhóm mới có thể xóa thẻ này',
      );
    }

    await this.prisma.groupCard.delete({ where: { id: cardId } });
    return { message: 'Đã xóa thẻ thành công' };
  }

  async nudgeMember(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Bạn không thể tự nhắc nhở chính mình');
    }

    const [senderMembership, targetMembership] = await Promise.all([
      this.prisma.studyGroupMember.findFirst({
        where: { userId },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.studyGroupMember.findFirst({
        where: { userId: targetUserId },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    if (
      !senderMembership ||
      !targetMembership ||
      senderMembership.groupId !== targetMembership.groupId
    ) {
      throw new ForbiddenException('Hai người không ở trong cùng một nhóm');
    }

    const senderName =
      senderMembership.user.name || senderMembership.user.email;
    const targetName =
      targetMembership.user.name || targetMembership.user.email;

    const activity = await this.prisma.groupActivity.create({
      data: {
        groupId: senderMembership.groupId,
        userId,
        type: ActivityType.NUDGE,
        metadata: {
          fromName: senderName,
          toName: targetName,
          targetUserId,
        },
      },
    });

    // Bắn Web Push Notification tới thành viên được nhắc nhở
    this.notificationsService
      .sendPushToUser(targetUserId, {
        title: '🔔 Lời nhắc học tập từ đồng đội!',
        body: `${senderName} vừa nhắc bạn vào hoàn thành mục tiêu học tập ngày hôm nay! 🔥`,
        url: '/groups',
        tag: 'squad-nudge',
      })
      .catch((err: unknown) => {
        // Non-blocking log
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Push notification delivery warning:', msg);
      });

    return activity;
  }

  async leaveGroup(userId: string, languageCode?: string) {
    const membership = await this.prisma.studyGroupMember.findFirst({
      where: {
        userId,
        ...(languageCode && { group: { languageCode } }),
      },
      include: {
        group: { include: { members: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!membership) {
      throw new NotFoundException('Bạn không ở trong nhóm nào');
    }

    const group = membership.group;

    // Nếu chỉ có 1 mình trong nhóm -> xóa luôn nhóm
    if (group.members.length <= 1) {
      await this.prisma.studyGroup.delete({ where: { id: group.id } });
      return { message: 'Đã rời và giải tán nhóm' };
    }

    // Nếu là LEADER rời nhóm -> chuyển quyền LEADER cho thành viên kế tiếp
    if (membership.role === GroupRole.LEADER) {
      const nextLeader = group.members.find((m) => m.userId !== userId);
      if (nextLeader) {
        await this.prisma.studyGroupMember.update({
          where: { id: nextLeader.id },
          data: { role: GroupRole.LEADER },
        });
      }
    }

    await this.prisma.studyGroupMember.delete({ where: { id: membership.id } });
    return { message: 'Đã rời nhóm thành công' };
  }

  async getLeagueLeaderboard(userId: string, languageCode?: string) {
    const lang = languageCode ?? 'ko';

    const groups = await this.prisma.studyGroup.findMany({
      where: {
        languageCode: lang,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                avatarFrame: true,
              },
            },
          },
        },
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });

    const leagueRankings = groups.map((g) => {
      const totalWeeklyXp = g.members.reduce(
        (acc, m) => acc + (m.weeklyXp || 0),
        0,
      );
      const totalXp = g.members.reduce((acc, m) => acc + (m.totalXp || 0), 0);
      const isMyGroup = g.members.some((m) => m.userId === userId);

      return {
        id: g.id,
        name: g.name,
        description: g.description,
        avatarUrl: g.avatarUrl,
        languageCode: g.languageCode,
        memberCount: g.members.length,
        maxMembers: g.maxMembers,
        totalWeeklyXp,
        totalXp,
        isMyGroup,
        topMembers: g.members
          .sort((a, b) => (b.weeklyXp || 0) - (a.weeklyXp || 0))
          .slice(0, 3)
          .map((m) => ({
            id: m.user.id,
            name: m.user.name,
            avatarUrl: m.user.avatarUrl,
            avatarFrame: m.user.avatarFrame,
            weeklyXp: m.weeklyXp,
          })),
      };
    });

    // Sắp xếp giảm dần theo tổng XP tuần của nhóm
    leagueRankings.sort((a, b) => b.totalWeeklyXp - a.totalWeeklyXp);

    return leagueRankings.map((group, index) => ({
      rank: index + 1,
      ...group,
    }));
  }
}
