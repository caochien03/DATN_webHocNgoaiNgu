import { Module } from '@nestjs/common';
import {
  LanguagesCatalogController,
  LanguagesController,
} from './languages.controller';
import { LanguagesService } from './languages.service';

@Module({
  controllers: [LanguagesController, LanguagesCatalogController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
