import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminTopicsService } from './admin-topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateTopicWordDto, UpdateTopicWordDto } from './dto/topic-word.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('admin/topics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminTopicsController {
  constructor(private readonly adminTopicsService: AdminTopicsService) {}

  @Get()
  list(
    @Query('language') language?: string,
    @Query('level') level?: string,
  ) {
    return this.adminTopicsService.list(language, level);
  }

  @Post()
  create(@Body() dto: CreateTopicDto) {
    return this.adminTopicsService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.adminTopicsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.adminTopicsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminTopicsService.remove(id);
  }

  @Post(':id/words')
  createWord(
    @Param('id') topicId: string,
    @Body() dto: CreateTopicWordDto,
  ) {
    return this.adminTopicsService.createWord(topicId, dto);
  }

  @Patch(':id/words/:wordId')
  updateWord(
    @Param('id') topicId: string,
    @Param('wordId') wordId: string,
    @Body() dto: UpdateTopicWordDto,
  ) {
    return this.adminTopicsService.updateWord(topicId, wordId, dto);
  }

  @Delete(':id/words/:wordId')
  removeWord(
    @Param('id') topicId: string,
    @Param('wordId') wordId: string,
  ) {
    return this.adminTopicsService.removeWord(topicId, wordId);
  }
}
