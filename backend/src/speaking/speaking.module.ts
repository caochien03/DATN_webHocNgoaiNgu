import { Module } from '@nestjs/common';
import { SpeakingAiService } from './speaking-ai.service';
import { SpeakingController } from './speaking.controller';
import { SpeakingGeminiService } from './speaking-gemini.service';
import { SpeakingService } from './speaking.service';
import { SpeakingSttService } from './speaking-stt.service';
import { SpeakingTtsService } from './speaking-tts.service';
import { SpeakingWhisperService } from './speaking-whisper.service';

@Module({
  controllers: [SpeakingController],
  providers: [
    SpeakingGeminiService,
    SpeakingWhisperService,
    SpeakingSttService,
    SpeakingAiService,
    SpeakingService,
    SpeakingTtsService,
  ],
  exports: [
    SpeakingService,
    SpeakingSttService,
    SpeakingAiService,
    SpeakingTtsService,
    SpeakingWhisperService,
  ],
})
export class SpeakingModule {}
