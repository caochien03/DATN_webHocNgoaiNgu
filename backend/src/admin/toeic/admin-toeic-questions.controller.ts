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
import { ToeicSection } from '@prisma/client';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminToeicQuestionsService } from './admin-toeic-questions.service';
import {
  CreateToeicQuestionDto,
  UpdateToeicQuestionDto,
} from './dto/toeic-question.dto';

@Controller('admin/toeic/questions')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminToeicQuestionsController {
  constructor(
    private readonly adminToeicQuestionsService: AdminToeicQuestionsService,
  ) {}

  @Get()
  list(@Query('section') section?: ToeicSection) {
    return this.adminToeicQuestionsService.list(section);
  }

  @Post()
  create(@Body() dto: CreateToeicQuestionDto) {
    return this.adminToeicQuestionsService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.adminToeicQuestionsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateToeicQuestionDto) {
    return this.adminToeicQuestionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminToeicQuestionsService.remove(id);
  }
}
