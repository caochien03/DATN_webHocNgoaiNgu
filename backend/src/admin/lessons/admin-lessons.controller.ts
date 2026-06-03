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
import { AdminLessonsService } from './admin-lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('admin/lessons')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminLessonsController {
  constructor(private readonly adminLessonsService: AdminLessonsService) {}

  @Get()
  list() {
    return this.adminLessonsService.list();
  }

  @Post()
  create(@Body() dto: CreateLessonDto) {
    return this.adminLessonsService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.adminLessonsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.adminLessonsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminLessonsService.remove(id);
  }
}
