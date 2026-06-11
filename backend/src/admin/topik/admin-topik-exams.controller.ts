import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminTopikExamsService } from './admin-topik-exams.service';
import {
  AddTopikExamQuestionDto,
  CreateTopikExamWithQuestionsDto,
  UpdateTopikExamDto,
} from './dto/topik-exam.dto';

@Controller('admin/topik/exams')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminTopikExamsController {
  constructor(private readonly adminTopikExamsService: AdminTopikExamsService) {}

  @Get()
  list() {
    return this.adminTopikExamsService.list();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importExam(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('file field is required');
    }
    return this.adminTopikExamsService.importFromJson(file);
  }

  @Post()
  create(@Body() dto: CreateTopikExamWithQuestionsDto) {
    return this.adminTopikExamsService.createWithQuestions(dto);
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
}
