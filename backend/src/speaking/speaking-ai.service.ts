import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  buildSpeakingAudioTurnPrompt,
  buildSpeakingSessionSummaryPrompt,
  buildSpeakingTextTurnPrompt,
  parseSpeakingAudioTurnResponse,
  parseSpeakingSessionSummaryResponse,
  parseSpeakingTextTurnResponse,
  type SpeakingAudioTurnResult,
  type SpeakingSessionSummaryInput,
  type SpeakingSessionSummaryResult,
  type SpeakingTurnContext,
} from './speaking-ai';
import { validateSpeakingAudio } from './speaking-audio';
import { SpeakingGeminiService } from './speaking-gemini.service';
import { SpeakingWhisperService } from './speaking-whisper.service';

@Injectable()
export class SpeakingAiService {
  private readonly logger = new Logger(SpeakingAiService.name);

  constructor(
    private readonly gemini: SpeakingGeminiService,
    private readonly whisper: SpeakingWhisperService,
  ) {}

  get enabled(): boolean {
    return this.gemini.enabled;
  }

  /**
   * Xử lý một lượt audio:
   * - Nếu có OPENAI_API_KEY: Whisper STT → transcript → Gemini text-only
   * - Fallback: Gemini audio (STT + dialogue trong 1 lần gọi)
   */
  async processAudioTurn(
    audio: Buffer,
    mimeType: string | undefined,
    ctx: SpeakingTurnContext,
  ): Promise<SpeakingAudioTurnResult> {
    this.gemini.assertEnabled();
    const normalizedMime = validateSpeakingAudio(audio, mimeType);

    // Xác định BCP-47 language code cho Whisper
    const whisperLang =
      ctx.targetLanguage === 'en'
        ? 'en'
        : ctx.targetLanguage === 'ko'
          ? 'ko'
          : undefined;

    // ─── Luồng chính: Whisper STT + Gemini text ───
    if (this.whisper.enabled) {
      let transcript: string | null = null;
      try {
        this.logger.debug('Dùng Whisper STT để nhận diện giọng nói...');
        transcript = await this.whisper.transcribe(
          audio,
          mimeType,
          whisperLang,
        );
        this.logger.debug(`Whisper transcript: "${transcript}"`);
      } catch (e) {
        if (e instanceof BadRequestException) throw e;
        this.logger.warn(
          `Whisper thất bại, thử fallback Gemini audio: ${e instanceof Error ? e.message : String(e)}`,
        );
      }

      if (transcript) {
        try {
          const prompt = buildSpeakingTextTurnPrompt(ctx, transcript);
          const text = await this.gemini.generateText(prompt);
          return parseSpeakingTextTurnResponse(text, ctx, transcript);
        } catch (e) {
          this.logger.error(
            `Gemini generateText thất bại: ${e instanceof Error ? e.message : String(e)}`,
          );
          const msg = String(e);
          if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
            throw new BadRequestException(
              'Gia sư AI đang phản hồi chậm do quá tải, bạn vui lòng thử lại sau giây lát nhé.',
            );
          }
          throw new BadRequestException(
            'Không thể tạo phản hồi từ AI. Vui lòng thử lại sau giây lát.',
          );
        }
      }
    }

    // ─── Fallback: Gemini audio trực tiếp (khi không bật Whisper) ───
    try {
      const prompt = buildSpeakingAudioTurnPrompt(ctx);
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
      const msg = String(e);
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        throw new BadRequestException(
          'Gia sư AI đang phản hồi chậm do quá tải, bạn vui lòng thử lại sau giây lát nhé.',
        );
      }
      throw new BadRequestException(
        'Gia sư AI tạm thời chưa thể nghe rõ câu trả lời, bạn vui lòng thử nói lại nhé.',
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
