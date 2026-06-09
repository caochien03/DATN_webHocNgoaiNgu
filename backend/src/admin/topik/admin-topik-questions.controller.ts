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
import { TopikSection, TopikTier } from '@prisma/client';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminTopikQuestionsService } from './admin-topik-questions.service';
import { CreateTopikQuestionDto, UpdateTopikQuestionDto } from './dto/topik-question.dto';

@Controller('admin/topik/questions')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminTopikQuestionsController {
  constructor(
    private readonly adminTopikQuestionsService: AdminTopikQuestionsService,
  ) {}

  @Get()
  list(
    @Query('tier') tier?: TopikTier,
    @Query('section') section?: TopikSection,
    @Query('questionNo') questionNo?: string,
    @Query('fromNo') fromNo?: string,
    @Query('toNo') toNo?: string,
  ) {
    return this.adminTopikQuestionsService.list({
      tier,
      section,
      ...(questionNo !== undefined && {
        questionNo: parseInt(questionNo, 10),
      }),
      ...(fromNo !== undefined &&
        toNo !== undefined && {
          fromNo: parseInt(fromNo, 10),
          toNo: parseInt(toNo, 10),
        }),
    });
  }

  @Post()
  create(@Body() dto: CreateTopikQuestionDto) {
    return this.adminTopikQuestionsService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.adminTopikQuestionsService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTopikQuestionDto) {
    return this.adminTopikQuestionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminTopikQuestionsService.remove(id);
  }
}
