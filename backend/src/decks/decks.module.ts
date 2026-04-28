import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { ReviewController } from './review.controller';

@Module({
  controllers: [DecksController, CardsController, ReviewController],
  providers: [DecksService],
  exports: [DecksService],
})
export class DecksModule {}
