import { Module } from '@nestjs/common';
import { LessonsModule } from '../lessons/lessons.module';
import { PathsModule } from '../paths/paths.module';
import { TopicsModule } from '../topics/topics.module';
import { AdminLessonsController } from './lessons/admin-lessons.controller';
import { AdminLessonsService } from './lessons/admin-lessons.service';
import { AdminPathsController } from './paths/admin-paths.controller';
import { AdminPathsService } from './paths/admin-paths.service';
import { AdminTopicsController } from './topics/admin-topics.controller';
import { AdminTopicsService } from './topics/admin-topics.service';

@Module({
  imports: [LessonsModule, TopicsModule, PathsModule],
  controllers: [
    AdminLessonsController,
    AdminTopicsController,
    AdminPathsController,
  ],
  providers: [AdminLessonsService, AdminTopicsService, AdminPathsService],
})
export class AdminModule {}
