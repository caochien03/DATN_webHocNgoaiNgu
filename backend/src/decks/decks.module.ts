import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';

@Module({
  controllers: [DecksController, CardsController],
  providers: [DecksService],
  exports: [DecksService],
})
export class DecksModule {}
