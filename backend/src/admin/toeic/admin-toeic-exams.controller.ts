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
import { AdminToeicExamsService } from './admin-toeic-exams.service';
import {
  AddToeicExamQuestionDto,
  CreateToeicExamWithQuestionsDto,
  UpdateToeicExamDto,
} from './dto/toeic-exam.dto';

@Controller('admin/toeic/exams')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminToeicExamsController {
  constructor(
    private readonly adminToeicExamsService: AdminToeicExamsService,
  ) {}

  @Get()
  list() {
    return this.adminToeicExamsService.list();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importExam(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('file field is required');
    }
    return this.adminToeicExamsService.importFromJson(file);
  }

  @Post()
  create(@Body() dto: CreateToeicExamWithQuestionsDto) {
    return this.adminToeicExamsService.createWithQuestions(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.adminToeicExamsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateToeicExamDto) {
    return this.adminToeicExamsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminToeicExamsService.remove(id);
  }

  @Post(':id/questions')
  addQuestion(
    @Param('id') examId: string,
    @Body() dto: AddToeicExamQuestionDto,
  ) {
    return this.adminToeicExamsService.addQuestion(examId, dto);
  }
}
