import { Module } from '@nestjs/common';
import { GoalsModule } from '../goals/goals.module';
import { UsersController } from './users.controller';
import { ProgressService } from './progress.service';
import { UsersService } from './users.service';

@Module({
  imports: [GoalsModule],
  controllers: [UsersController],
  providers: [UsersService, ProgressService],
  exports: [UsersService],
})
export class UsersModule {}
