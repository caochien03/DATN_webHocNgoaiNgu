import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DecksModule } from './decks/decks.module';
import { GrammarModule } from './grammar/grammar.module';
import { PrismaModule } from './prisma/prisma.module';
import { TopicsModule } from './topics/topics.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    DecksModule,
    TopicsModule,
    GrammarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
