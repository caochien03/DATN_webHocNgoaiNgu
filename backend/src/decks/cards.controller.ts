import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DecksService } from './decks.service';
import { AttemptCardDto } from './dto/attempt-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly decksService: DecksService) {}

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.decksService.updateCard(cardId, userId, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') cardId: string) {
    await this.decksService.deleteCard(cardId, userId);
    return { ok: true };
  }

  @Post(':id/attempt')
  attempt(
    @CurrentUser('id') userId: string,
    @Param('id') cardId: string,
    @Body() dto: AttemptCardDto,
  ) {
    return this.decksService.recordAttempt(cardId, userId, dto.isCorrect);
  }
}
