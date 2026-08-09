import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribePushDto } from './dto/subscribe-push.dto';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidConfigured = false;
  private publicKey = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.config.get<string>('VAPID_SUBJECT') ?? 'mailto:support@chingo.app';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.publicKey = publicKey;
      this.vapidConfigured = true;
      this.logger.log('Web Push VAPID keys successfully initialized.');
    } else {
      this.logger.warn('VAPID keys not configured in environment variables.');
    }
  }

  getVapidPublicKey(): { publicKey: string; enabled: boolean } {
    return {
      publicKey: this.publicKey,
      enabled: this.vapidConfigured,
    };
  }

  async saveSubscription(userId: string, dto: SubscribePushDto) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: {
        userId,
        p256dh: dto.p256dh,
        auth: dto.auth,
        userAgent: dto.userAgent,
      },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.p256dh,
        auth: dto.auth,
        userAgent: dto.userAgent,
      },
    });
  }

  async removeSubscription(endpoint: string) {
    return this.prisma.pushSubscription
      .deleteMany({
        where: { endpoint },
      })
      .catch(() => null);
  }

  async sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
    if (!this.vapidConfigured) {
      return 0;
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (!subscriptions.length) {
      return 0;
    }

    const jsonPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon ?? '/logo.png',
      badge: payload.badge ?? '/logo.png',
      url: payload.url ?? '/groups',
      tag: payload.tag ?? 'chingo-notice',
      data: payload.data ?? {},
    });

    let successCount = 0;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            jsonPayload,
          );
          successCount++;
        } catch (error: unknown) {
          // If subscription is expired or gone (410 / 404), clean up
          const errObj = error as
            | { statusCode?: number; message?: string }
            | undefined;
          const statusCode = errObj?.statusCode;
          const msg =
            errObj?.message ??
            (error instanceof Error ? error.message : String(error));

          if (statusCode === 410 || statusCode === 404) {
            this.logger.warn(
              `Push subscription expired or invalid, removing: ${sub.endpoint}`,
            );
            await this.prisma.pushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => null);
          } else {
            this.logger.error(`Error sending push notification: ${msg}`);
          }
        }
      }),
    );

    return successCount;
  }

  async sendPushToGroup(
    groupId: string,
    payload: PushPayload,
    excludeUserId?: string,
  ): Promise<number> {
    const members = await this.prisma.studyGroupMember.findMany({
      where: {
        groupId,
        ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      },
      select: { userId: true },
    });

    let totalSent = 0;
    for (const m of members) {
      const count = await this.sendPushToUser(m.userId, payload);
      totalSent += count;
    }
    return totalSent;
  }
}
