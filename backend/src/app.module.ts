import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DecksModule } from './decks/decks.module';
import { GoalsModule } from './goals/goals.module';
import { LanguagesModule } from './languages/languages.module';
import { LessonsModule } from './lessons/lessons.module';
import { PathsModule } from './paths/paths.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuizAttemptsModule } from './quiz-attempts/quiz-attempts.module';
import { SpeakingModule } from './speaking/speaking.module';
import { ToeicModule } from './toeic/toeic.module';
import { TopikModule } from './topik/topik.module';
import { TopicsModule } from './topics/topics.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
