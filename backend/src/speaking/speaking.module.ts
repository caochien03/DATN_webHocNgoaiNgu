import { Module } from '@nestjs/common';
import { SpeakingAiService } from './speaking-ai.service';
import { SpeakingGeminiService } from './speaking-gemini.service';
import { SpeakingSttService } from './speaking-stt.service';

@Module({
  providers: [SpeakingGeminiService, SpeakingSttService, SpeakingAiService],
  exports: [SpeakingSttService, SpeakingAiService, SpeakingGeminiService],
})
export class SpeakingModule {}
