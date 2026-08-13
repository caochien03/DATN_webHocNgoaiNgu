import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DecksModule } from './decks/decks.module';
import { GoalsModule } from './goals/goals.module';
import { GroupsModule } from './groups/groups.module';
import { LanguagesModule } from './languages/languages.module';
import { LessonsModule } from './lessons/lessons.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PathsModule } from './paths/paths.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuizAttemptsModule } from './quiz-attempts/quiz-attempts.module';
import { SpeakingModule } from './speaking/speaking.module';
import { ToeicModule } from './toeic/toeic.module';
import { TopikModule } from './topik/topik.module';
import { TopicsModule } from './topics/topics.module';
import { UsersModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    LanguagesModule,
    AdminModule,
    DecksModule,
    GoalsModule,
    TopicsModule,
    LessonsModule,
    PathsModule,
    QuizAttemptsModule,
    SpeakingModule,
    TopikModule,
    ToeicModule,
    GroupsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
