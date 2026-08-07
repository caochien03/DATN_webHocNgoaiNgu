import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PathsService } from './paths.service';

@Controller('paths')
@UseGuards(JwtAuthGuard)
export class PathsController {
  constructor(private readonly pathsService: PathsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.pathsService.list(userId, languageCode);
  }

  @Get('source-status')
  getSourceStatus(
    @CurrentUser('id') userId: string,
    @Query('sourceType') sourceType: string,
    @Query('sourceId') sourceId: string,
  ) {
    return this.pathsService.getSourcePathStatus(userId, sourceType, sourceId);
  }

  @Get(':id')
  getOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.pathsService.get(id, userId);
  }

  @Post('complete-by-source')
  async completeBySource(
    @CurrentUser('id') userId: string,
    @Body() body: { sourceType: string; sourceId: string },
  ) {
    const completedStepIds = await this.pathsService.autoCompleteStepIfExists(
      userId,
      body.sourceType,
      body.sourceId,
    );
    return {
      success: true,
      completedStepIds,
      count: completedStepIds.length,
    };
  }

  @Post(':id/start')
  start(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.pathsService.start(id, userId);
  }

  @Post(':id/steps/:stepId/complete')
  completeStep(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('stepId') stepId: string,
  ) {
    return this.pathsService.completeStep(id, stepId, userId);
  }
}
