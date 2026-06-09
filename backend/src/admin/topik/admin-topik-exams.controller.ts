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
import { AdminTopikExamsService } from './admin-topik-exams.service';
import {
  AddTopikExamQuestionDto,
  CreateTopikExamDto,
  UpdateTopikExamDto,
  UpdateTopikExamQuestionDto,
} from './dto/topik-exam.dto';

@Controller('admin/topik/exams')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminTopikExamsController {
  constructor(private readonly adminTopikExamsService: AdminTopikExamsService) {}

  @Get()
  list() {
    return this.adminTopikExamsService.list();
  }

  @Post()
  create(@Body() dto: CreateTopikExamDto) {
    return this.adminTopikExamsService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.adminTopikExamsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTopikExamDto) {
    return this.adminTopikExamsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminTopikExamsService.remove(id);
  }

  @Post(':id/questions')
  addQuestion(
    @Param('id') examId: string,
    @Body() dto: AddTopikExamQuestionDto,
  ) {
    return this.adminTopikExamsService.addQuestion(examId, dto);
  }

  @Patch(':id/questions/:slotId')
  updateQuestionSlot(
    @Param('id') examId: string,
    @Param('slotId') slotId: string,
    @Body() dto: UpdateTopikExamQuestionDto,
  ) {
    return this.adminTopikExamsService.updateQuestionSlot(examId, slotId, dto);
  }

  @Delete(':id/questions/:slotId')
  removeQuestion(
    @Param('id') examId: string,
    @Param('slotId') slotId: string,
  ) {
    return this.adminTopikExamsService.removeQuestion(examId, slotId);
  }
}
