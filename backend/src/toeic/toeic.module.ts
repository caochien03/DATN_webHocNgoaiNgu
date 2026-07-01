import { Module } from '@nestjs/common';
import { ToeicController } from './toeic.controller';
import { ToeicService } from './toeic.service';

@Module({
  controllers: [ToeicController],
  providers: [ToeicService],
  exports: [ToeicService],
})
export class ToeicModule {}
