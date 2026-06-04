import { Module } from '@nestjs/common';
import { LessonsModule } from '../lessons/lessons.module';
import { TopicsModule } from '../topics/topics.module';
import { AdminLessonsController } from './lessons/admin-lessons.controller';
import { AdminLessonsService } from './lessons/admin-lessons.service';
import { AdminTopicsController } from './topics/admin-topics.controller';
import { AdminTopicsService } from './topics/admin-topics.service';

@Module({
  imports: [LessonsModule, TopicsModule],
  controllers: [AdminLessonsController, AdminTopicsController],
  providers: [AdminLessonsService, AdminTopicsService],
})
export class AdminModule {}
