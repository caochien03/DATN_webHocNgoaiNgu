import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  buildSpeakingAudioTurnPrompt,
  buildSpeakingSessionSummaryPrompt,
  parseSpeakingAudioTurnResponse,
  parseSpeakingSessionSummaryResponse,
  type SpeakingAudioTurnResult,
  type SpeakingSessionSummaryInput,
  type SpeakingSessionSummaryResult,
  type SpeakingTurnContext,
} from './speaking-ai';
import { validateSpeakingAudio } from './speaking-audio';
import { SpeakingGeminiService } from './speaking-gemini.service';

@Injectable()
export class SpeakingAiService {
  private readonly logger = new Logger(SpeakingAiService.name);

  constructor(private readonly gemini: SpeakingGeminiService) {}

  get enabled(): boolean {
    return this.gemini.enabled;
  }

  async processAudioTurn(
    audio: Buffer,
    mimeType: string | undefined,
    ctx: SpeakingTurnContext,
  ): Promise<SpeakingAudioTurnResult> {
    this.gemini.assertEnabled();
    const normalizedMime = validateSpeakingAudio(audio, mimeType);
    const prompt = buildSpeakingAudioTurnPrompt(ctx);

    try {
      const text = await this.gemini.generateFromAudio(
        prompt,
        audio,
        normalizedMime,
      );
      return parseSpeakingAudioTurnResponse(text, ctx);
    } catch (e) {
      this.logger.error(
        `Xử lý audio lượt nói thất bại: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new BadRequestException(
        'AI không thể xử lý lượt nói. Vui lòng thử lại.',
      );
    }
  }

  async summarizeSession(
    input: SpeakingSessionSummaryInput,
  ): Promise<SpeakingSessionSummaryResult> {
    this.gemini.assertEnabled();
    const prompt = buildSpeakingSessionSummaryPrompt(input);

    try {
      const text = await this.gemini.generateText(prompt);
      return parseSpeakingSessionSummaryResponse(text, input);
    } catch (e) {
      this.logger.error(
        `Tổng kết phiên thất bại: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new BadRequestException(
        'AI không thể tổng kết phiên. Vui lòng thử lại.',
      );
    }
  }
}
