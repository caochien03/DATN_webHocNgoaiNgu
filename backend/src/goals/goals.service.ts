import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addVnDays, toVnDayStart } from './vn-day';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string, languageCode = 'ko') {
    const lang = languageCode || 'ko';
    const setting = await this.prisma.userGoalSetting.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    const todayDate = toVnDayStart(new Date());
    const todayProgress = await this.prisma.userDailyProgress.findUnique({
      where: {
        userId_date_languageCode: {
          userId,
          date: todayDate,
          languageCode: lang,
        },
      },
    });
    const reviewedToday = todayProgress?.reviewedCards ?? 0;
    const achievedToday = reviewedToday >= setting.dailyCardTarget;
    const { streak, bestStreak } = await this.getStreakStats(
      userId,
      todayDate,
      lang,
    );
    return {
      languageCode: lang,
      dailyCardTarget: setting.dailyCardTarget,
      timezone: setting.timezone,
      today: {
        reviewedCards: reviewedToday,
        target: setting.dailyCardTarget,
        percent:
          setting.dailyCardTarget > 0
            ? Math.min(
                100,
                Math.round((reviewedToday / setting.dailyCardTarget) * 100),
              )
            : 0,
        achieved: achievedToday,
      },
      streak,
      bestStreak,
    };
  }

  async updateMe(userId: string, dailyCardTarget: number, languageCode = 'ko') {
    const lang = languageCode || 'ko';
    await this.prisma.userGoalSetting.upsert({
      where: { userId },
      update: { dailyCardTarget },
      create: { userId, dailyCardTarget },
    });
    const todayDate = toVnDayStart(new Date());
    const today = await this.prisma.userDailyProgress.upsert({
      where: {
        userId_date_languageCode: {
          userId,
          date: todayDate,
          languageCode: lang,
        },
      },
      update: { goalTarget: dailyCardTarget },
      create: {
        userId,
        date: todayDate,
        languageCode: lang,
        goalTarget: dailyCardTarget,
        goalAchieved: false,
      },
    });
    if (today.reviewedCards >= dailyCardTarget && !today.goalAchieved) {
      await this.prisma.userDailyProgress.update({
        where: { id: today.id },
        data: { goalAchieved: true },
      });
    }
    return this.getMe(userId, lang);
  }

  async getHistory(userId: string, days = 30, languageCode = 'ko') {
    const lang = languageCode || 'ko';
    const safeDays = Number.isFinite(days)
      ? Math.min(Math.max(days, 7), 90)
      : 30;
    const today = toVnDayStart(new Date());
    const start = addVnDays(today, -(safeDays - 1));
    const rows = await this.prisma.userDailyProgress.findMany({
      where: { userId, languageCode: lang, date: { gte: start, lte: today } },
      orderBy: { date: 'asc' },
    });
    return rows.map((r) => ({
      date: r.date,
      reviewedCards: r.reviewedCards,
      goalTarget: r.goalTarget,
      goalAchieved: r.goalAchieved,
    }));
  }

  private async getStreakStats(
    userId: string,
    todayDate: Date,
    languageCode: string,
  ) {
    const rows = await this.prisma.userDailyProgress.findMany({
      where: {
        userId,
        languageCode,
        goalAchieved: true,
        date: { lte: todayDate },
      },
      orderBy: { date: 'asc' },
      take: 365,
      select: { date: true },
    });
    const achievedSet = new Set(rows.map((r) => r.date.getTime()));
    let streak = 0;
    let cursor = todayDate;
    while (achievedSet.has(cursor.getTime())) {
      streak += 1;
      cursor = addVnDays(cursor, -1);
    }
    let bestStreak = 0;
    let run = 0;
    let prev: number | null = null;
    for (const row of rows) {
      const current = row.date.getTime();
      if (prev === null || current - prev === 24 * 60 * 60 * 1000) {
        run += 1;
      } else {
        run = 1;
      }
      if (run > bestStreak) bestStreak = run;
      prev = current;
    }
    return { streak, bestStreak };
  }
}
