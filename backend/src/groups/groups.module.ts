import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

import { GroupsCronService } from './groups.cron.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [GroupsController],
  providers: [GroupsService, GroupsCronService],
  exports: [GroupsService],
})
export class GroupsModule {}
