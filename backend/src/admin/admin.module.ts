import { Module } from '@nestjs/common';
import { LessonsModule } from '../lessons/lessons.module';
import { AdminLessonsController } from './lessons/admin-lessons.controller';
import { AdminLessonsService } from './lessons/admin-lessons.service';

@Module({
  imports: [LessonsModule],
  controllers: [AdminLessonsController],
  providers: [AdminLessonsService],
})
export class AdminModule {}
