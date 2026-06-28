import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  buildSpeakingSessionSummaryPrompt,
  buildSpeakingTurnPrompt,
  parseSpeakingSessionSummaryResponse,
  parseSpeakingTurnResponse,
  type SpeakingSessionSummaryInput,
  type SpeakingSessionSummaryResult,
  type SpeakingTurnInput,
  type SpeakingTurnResult,
} from './speaking-ai';
import { SpeakingGeminiService } from './speaking-gemini.service';

@Injectable()
export class SpeakingAiService {
  private readonly logger = new Logger(SpeakingAiService.name);

  constructor(private readonly gemini: SpeakingGeminiService) {}

  get enabled(): boolean {
    return this.gemini.enabled;
  }

  async processTurn(input: SpeakingTurnInput): Promise<SpeakingTurnResult> {
    this.gemini.assertEnabled();
    const prompt = buildSpeakingTurnPrompt(input);

    try {
      const text = await this.gemini.generateText(prompt);
      return parseSpeakingTurnResponse(text, input);
    } catch (e) {
      this.logger.error(
        `Xử lý lượt nói thất bại: ${e instanceof Error ? e.message : String(e)}`,
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
