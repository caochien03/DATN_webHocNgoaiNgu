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
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminPathsService } from './admin-paths.service';
import { CreatePathDto } from './dto/create-path.dto';
import { CreatePathStepDto, UpdatePathStepDto } from './dto/path-step.dto';
import { UpdatePathDto } from './dto/update-path.dto';

@Controller('admin/paths')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminPathsController {
  constructor(private readonly adminPathsService: AdminPathsService) {}

  @Get()
  list() {
    return this.adminPathsService.list();
  }

  @Post()
  create(@Body() dto: CreatePathDto) {
    return this.adminPathsService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.adminPathsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePathDto) {
    return this.adminPathsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminPathsService.remove(id);
  }

  @Post(':id/steps')
  createStep(@Param('id') pathId: string, @Body() dto: CreatePathStepDto) {
    return this.adminPathsService.createStep(pathId, dto);
  }

  @Patch(':id/steps/:stepId')
  updateStep(
    @Param('id') pathId: string,
    @Param('stepId') stepId: string,
    @Body() dto: UpdatePathStepDto,
  ) {
    return this.adminPathsService.updateStep(pathId, stepId, dto);
  }

  @Delete(':id/steps/:stepId')
  removeStep(@Param('id') pathId: string, @Param('stepId') stepId: string) {
    return this.adminPathsService.removeStep(pathId, stepId);
  }
}
