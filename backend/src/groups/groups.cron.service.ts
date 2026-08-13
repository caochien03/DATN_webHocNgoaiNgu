import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { addVnDays, toVnDayStart } from '../goals/vn-day';

@Injectable()
export class GroupsCronService {
  private readonly logger = new Logger(GroupsCronService.name);

  constructor(private readonly prisma: PrismaService) { }

  @Cron('1 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' }) // Chạy lúc 00:01 giờ VN mỗi ngày
  async calculateSquadStreaks() {
    this.logger.log('Bắt đầu tính toán Group Streak cho ngày hôm qua...');
    const now = new Date();
    const today = toVnDayStart(now);
    const yesterday = addVnDays(today, -1);

    const groups = await this.prisma.studyGroup.findMany({
      include: { members: true },
    });

    let updatedCount = 0;
    let brokenCount = 0;

    for (const group of groups) {
      // Chỉ tính những thành viên gia nhập từ hôm qua trở về trước
      const validMembers = group.members.filter(m => m.joinedAt < today);

      if (validMembers.length === 0) continue;

      const totalMembers = validMembers.length;

      const yesterdayProgresses = await this.prisma.userDailyProgress.findMany({
        where: {
          date: yesterday,
          languageCode: group.languageCode,
          userId: { in: validMembers.map((m) => m.userId) },
          goalAchieved: true,
        },
      });

      const isFullSquadYesterday = yesterdayProgresses.length === totalMembers;

      if (isFullSquadYesterday) {
        await this.prisma.studyGroup.update({
          where: { id: group.id },
          data: { squadStreak: { increment: 1 } },
        });
        updatedCount++;
      } else {
        if (group.squadStreak > 0) {
          await this.prisma.studyGroup.update({
            where: { id: group.id },
            data: { squadStreak: 0 },
          });
          brokenCount++;
        }
      }
    }

    this.logger.log(
      `Hoàn tất tính Group Streak: Tăng chuỗi cho ${updatedCount} nhóm, đứt chuỗi ${brokenCount} nhóm.`,
    );
  }
}
