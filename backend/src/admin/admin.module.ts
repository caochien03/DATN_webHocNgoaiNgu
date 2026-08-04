import { Module } from '@nestjs/common';
import { LessonsModule } from '../lessons/lessons.module';
import { PathsModule } from '../paths/paths.module';
import { TopicsModule } from '../topics/topics.module';
import { AdminLessonsController } from './lessons/admin-lessons.controller';
import { AdminLessonsService } from './lessons/admin-lessons.service';
import { AdminPathsController } from './paths/admin-paths.controller';
import { AdminPathsService } from './paths/admin-paths.service';
import { AdminSpeakingController } from './speaking/admin-speaking.controller';
import { AdminSpeakingService } from './speaking/admin-speaking.service';
import { AdminTopikExamsController } from './topik/admin-topik-exams.controller';
import { AdminTopikExamsService } from './topik/admin-topik-exams.service';
import { AdminTopikQuestionsController } from './topik/admin-topik-questions.controller';
import { AdminTopikQuestionsService } from './topik/admin-topik-questions.service';
import { AdminToeicExamsController } from './toeic/admin-toeic-exams.controller';
import { AdminToeicExamsService } from './toeic/admin-toeic-exams.service';
import { AdminToeicQuestionsController } from './toeic/admin-toeic-questions.controller';
import { AdminToeicQuestionsService } from './toeic/admin-toeic-questions.service';
import { AdminTopicsController } from './topics/admin-topics.controller';
import { AdminTopicsService } from './topics/admin-topics.service';

@Module({
  imports: [LessonsModule, TopicsModule, PathsModule],
  controllers: [
    AdminLessonsController,
    AdminTopicsController,
    AdminPathsController,
    AdminTopikQuestionsController,
    AdminTopikExamsController,
    AdminToeicExamsController,
    AdminToeicQuestionsController,
    AdminSpeakingController,
  ],
  providers: [
    AdminLessonsService,
    AdminTopicsService,
    AdminPathsService,
    AdminTopikQuestionsService,
    AdminTopikExamsService,
    AdminToeicExamsService,
    AdminToeicQuestionsService,
    AdminSpeakingService,
  ],
})
export class AdminModule {}
