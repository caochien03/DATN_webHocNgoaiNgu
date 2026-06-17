import { Module } from '@nestjs/common';
import { TopikController } from './topik.controller';
import { TopikService } from './topik.service';
import { TopikAiGradingService } from './topik-ai-grading.service';

@Module({
  controllers: [TopikController],
  providers: [TopikService, TopikAiGradingService],
  exports: [TopikService],
})
export class TopikModule {}
