import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PathsService } from './paths.service';

@Controller('paths')
@UseGuards(JwtAuthGuard)
export class PathsController {
  constructor(private readonly pathsService: PathsService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.pathsService.list(userId);
  }

  @Get(':id')
  getOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.pathsService.get(id, userId);
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
