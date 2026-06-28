import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeakingSelfLevel } from '@prisma/client';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SPEAKING_MAX_AUDIO_BYTES } from './speaking-audio';
import { CreateSpeakingSessionDto } from './dto/create-speaking-session.dto';
import { SpeakingService } from './speaking.service';

function parseTopicIds(raw?: string | string[]): string[] | undefined {
  if (!raw) return undefined;
  const parts = Array.isArray(raw)
    ? raw
    : raw.split(',').map((s) => s.trim());
  const ids = parts.filter(Boolean);
  return ids.length > 0 ? ids : undefined;
}

@Controller('speaking')
@UseGuards(JwtAuthGuard)
export class SpeakingController {
  constructor(private readonly speakingService: SpeakingService) {}

  @Get('topics')
  listTopics() {
    return this.speakingService.listTopics();
  }

  @Get('situations')
  listSituations(
    @Query('topicIds') topicIdsRaw?: string | string[],
    @Query('level') level?: SpeakingSelfLevel,
  ) {
    return this.speakingService.listSituations({
      topicIds: parseTopicIds(topicIdsRaw),
      level,
    });
  }

  @Get('sessions')
  listSessions(@CurrentUser('id') userId: string) {
    return this.speakingService.listSessions(userId);
  }

  @Post('sessions')
  createSession(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSpeakingSessionDto,
  ) {
    return this.speakingService.createSession(userId, dto);
  }

  @Get('sessions/:id')
  getSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.speakingService.getSession(userId, sessionId);
  }

  @Post('sessions/:id/turns')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: { fileSize: SPEAKING_MAX_AUDIO_BYTES },
    }),
  )
  submitTurn(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('durationSecs') durationSecsRaw?: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Thiếu file audio.');
    }
    const durationSecs =
      durationSecsRaw !== undefined && durationSecsRaw !== ''
        ? parseInt(durationSecsRaw, 10)
        : undefined;
    return this.speakingService.submitTurn(
      userId,
      sessionId,
      file.buffer,
      file.mimetype,
      Number.isFinite(durationSecs) ? durationSecs : undefined,
    );
  }

  @Post('sessions/:id/complete')
  completeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.speakingService.completeSession(userId, sessionId);
  }
}
