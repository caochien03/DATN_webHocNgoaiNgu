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
import { AdminSpeakingService } from './admin-speaking.service';
import {
  CreateSpeakingSituationDto,
  CreateSpeakingTopicDto,
  UpdateSpeakingSituationDto,
  UpdateSpeakingTopicDto,
} from './dto/speaking-admin.dto';

@Controller('admin/speaking')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminSpeakingController {
  constructor(private readonly adminSpeakingService: AdminSpeakingService) {}

  // ─── Topics ────────────────────────────────────────────────────────────────

  @Get('topics')
  listTopics(@Query('languageCode') languageCode?: string) {
    return this.adminSpeakingService.listTopics(languageCode);
  }

  @Post('topics')
  createTopic(@Body() dto: CreateSpeakingTopicDto) {
    return this.adminSpeakingService.createTopic(dto);
  }

  @Get('topics/:id')
  getTopic(@Param('id') id: string) {
    return this.adminSpeakingService.getTopic(id);
  }

  @Patch('topics/:id')
  updateTopic(@Param('id') id: string, @Body() dto: UpdateSpeakingTopicDto) {
    return this.adminSpeakingService.updateTopic(id, dto);
  }

  @Delete('topics/:id')
  removeTopic(@Param('id') id: string) {
    return this.adminSpeakingService.removeTopic(id);
  }

  // ─── Situations ────────────────────────────────────────────────────────────

  @Get('situations')
  listSituations(
    @Query('topicId') topicId?: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.adminSpeakingService.listSituations({ topicId, languageCode });
  }

  @Post('situations')
  createSituation(@Body() dto: CreateSpeakingSituationDto) {
    return this.adminSpeakingService.createSituation(dto);
  }

  @Get('situations/:id')
  getSituation(@Param('id') id: string) {
    return this.adminSpeakingService.getSituation(id);
  }

  @Patch('situations/:id')
  updateSituation(
    @Param('id') id: string,
    @Body() dto: UpdateSpeakingSituationDto,
  ) {
    return this.adminSpeakingService.updateSituation(id, dto);
  }

  @Delete('situations/:id')
  removeSituation(@Param('id') id: string) {
    return this.adminSpeakingService.removeSituation(id);
  }
}
