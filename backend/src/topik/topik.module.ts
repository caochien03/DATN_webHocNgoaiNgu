import { Module } from '@nestjs/common';
import { TopikController } from './topik.controller';
import { TopikService } from './topik.service';

@Module({
  controllers: [TopikController],
  providers: [TopikService],
  exports: [TopikService],
})
export class TopikModule {}
