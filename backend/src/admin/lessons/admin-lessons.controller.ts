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
import {
  CreateGrammarExerciseDto,
  UpdateGrammarExerciseDto,
} from './dto/grammar-exercise.dto';
import {
  CreateGrammarPointDto,
  UpdateGrammarPointDto,
} from './dto/grammar-point.dto';
import {
  CreateLessonVocabularyDto,
  UpdateLessonVocabularyDto,
} from './dto/lesson-vocabulary.dto';
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

  @Post(':id/vocabulary')
  createVocabulary(
    @Param('id') lessonId: string,
    @Body() dto: CreateLessonVocabularyDto,
  ) {
    return this.adminLessonsService.createVocabulary(lessonId, dto);
  }

  @Patch(':id/vocabulary/:vocabId')
  updateVocabulary(
    @Param('id') lessonId: string,
    @Param('vocabId') vocabId: string,
    @Body() dto: UpdateLessonVocabularyDto,
  ) {
    return this.adminLessonsService.updateVocabulary(lessonId, vocabId, dto);
  }

  @Delete(':id/vocabulary/:vocabId')
  removeVocabulary(
    @Param('id') lessonId: string,
    @Param('vocabId') vocabId: string,
  ) {
    return this.adminLessonsService.removeVocabulary(lessonId, vocabId);
  }

  @Post(':id/points')
  createPoint(
    @Param('id') lessonId: string,
    @Body() dto: CreateGrammarPointDto,
  ) {
    return this.adminLessonsService.createPoint(lessonId, dto);
  }

  @Patch(':id/points/:pointId')
  updatePoint(
    @Param('id') lessonId: string,
    @Param('pointId') pointId: string,
    @Body() dto: UpdateGrammarPointDto,
  ) {
    return this.adminLessonsService.updatePoint(lessonId, pointId, dto);
  }

  @Delete(':id/points/:pointId')
  removePoint(
    @Param('id') lessonId: string,
    @Param('pointId') pointId: string,
  ) {
    return this.adminLessonsService.removePoint(lessonId, pointId);
  }

  @Post(':id/exercises')
  createExercise(
    @Param('id') lessonId: string,
    @Body() dto: CreateGrammarExerciseDto,
  ) {
    return this.adminLessonsService.createExercise(lessonId, dto);
  }

  @Patch(':id/exercises/:exerciseId')
  updateExercise(
    @Param('id') lessonId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() dto: UpdateGrammarExerciseDto,
  ) {
    return this.adminLessonsService.updateExercise(lessonId, exerciseId, dto);
  }

  @Delete(':id/exercises/:exerciseId')
  removeExercise(
    @Param('id') lessonId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.adminLessonsService.removeExercise(lessonId, exerciseId);
  }
}
