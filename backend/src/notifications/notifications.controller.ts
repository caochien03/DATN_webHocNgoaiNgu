import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  SendTestPushDto,
  SubscribePushDto,
  UnsubscribePushDto,
} from './dto/subscribe-push.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return this.notificationsService.getVapidPublicKey();
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(
    @CurrentUser('id') userId: string,
    @Body() dto: SubscribePushDto,
  ) {
    const sub = await this.notificationsService.saveSubscription(userId, dto);
    return {
      success: true,
      message: 'Đăng ký nhận thông báo đẩy thành công!',
      subscriptionId: sub.id,
    };
  }

  @Post('unsubscribe')
  @UseGuards(JwtAuthGuard)
  async unsubscribe(@Body() dto: UnsubscribePushDto) {
    await this.notificationsService.removeSubscription(dto.endpoint);
    return {
      success: true,
      message: 'Hủy đăng ký nhận thông báo thành công!',
    };
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async sendTestPush(
    @CurrentUser('id') userId: string,
    @Body() dto: SendTestPushDto,
  ) {
    const sentCount = await this.notificationsService.sendPushToUser(userId, {
      title: dto.title ?? '🎉 Chingo - Thông Báo Đẩy Thử Nghiệm!',
      body:
        dto.body ??
        'Chúc mừng! Bạn đã kết nối Web Push Notification thành công. Bạn sẽ nhận được lời nhắc học bài ngay cả khi tắt web.',
      url: dto.url ?? '/groups',
    });

    return {
      success: true,
      sentCount,
      message:
        sentCount > 0
          ? `Đã gửi thông báo đẩy đến ${sentCount} thiết bị thành công!`
          : 'Chưa tìm thấy thiết bị nào được đăng ký cho tài khoản này.',
    };
  }
}
