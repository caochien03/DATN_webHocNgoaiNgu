import { Module } from '@nestjs/common';
import { SpeakingAiService } from './speaking-ai.service';
import { SpeakingController } from './speaking.controller';
import { SpeakingGeminiService } from './speaking-gemini.service';
import { SpeakingService } from './speaking.service';
import { SpeakingSttService } from './speaking-stt.service';

@Module({
  controllers: [SpeakingController],
  providers: [
    SpeakingGeminiService,
    SpeakingSttService,
    SpeakingAiService,
    SpeakingService,
  ],
  exports: [SpeakingService, SpeakingSttService, SpeakingAiService],
})
export class SpeakingModule {}
