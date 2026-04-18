import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DecksService } from './decks.service';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.decksService.listDecks(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDeckDto) {
    return this.decksService.createDeck(userId, dto);
  }

  @Get(':id')
  getOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.decksService.getDeck(id, userId);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDeckDto,
  ) {
    return this.decksService.updateDeck(id, userId, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.decksService.deleteDeck(id, userId);
    return { ok: true };
  }

  @Post(':id/cards')
  addCard(
    @CurrentUser('id') userId: string,
    @Param('id') deckId: string,
    @Body() dto: CreateCardDto,
  ) {
    return this.decksService.createCard(deckId, userId, dto);
  }
}
