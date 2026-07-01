import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddLearningLanguageDto } from './dto/add-learning-language.dto';
import { SetActiveLanguageDto } from './dto/set-active-language.dto';
import { LanguagesService } from './languages.service';

@Controller('users/me/languages')
@UseGuards(JwtAuthGuard)
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.languagesService.listForUser(userId);
  }

  @Post()
  add(
    @CurrentUser('id') userId: string,
    @Body() dto: AddLearningLanguageDto,
  ) {
    return this.languagesService.addForUser(userId, dto.languageCode);
  }

  @Patch('active')
  setActive(
    @CurrentUser('id') userId: string,
    @Body() dto: SetActiveLanguageDto,
  ) {
    return this.languagesService.setActive(userId, dto.languageCode);
  }
}

@Controller('languages')
export class LanguagesCatalogController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  listSupported() {
    return this.languagesService.listSupported();
  }
}
