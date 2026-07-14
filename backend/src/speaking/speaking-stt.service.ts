import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { cleanTranscript, validateSpeakingAudio } from './speaking-audio';
import { SpeakingGeminiService } from './speaking-gemini.service';

const TRANSCRIBE_PROMPT = [
  'Transcribe the spoken Korean in this audio.',
  'Return only the verbatim transcript in Korean (Hangul).',
  'Do not translate, summarize, or add labels.',
  'If the audio is silent or unintelligible, return an empty string.',
].join(' ');

@Injectable()
export class SpeakingSttService {
  private readonly logger = new Logger(SpeakingSttService.name);

  constructor(private readonly gemini: SpeakingGeminiService) {}

  get enabled(): boolean {
    return this.gemini.enabled;
  }

  async transcribe(
    buffer: Buffer,
    mimeType: string | undefined,
  ): Promise<string> {
    let normalizedMime: string;
    try {
      normalizedMime = validateSpeakingAudio(buffer, mimeType);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Audio không hợp lệ.',
      );
    }

    this.gemini.assertEnabled();

    try {
      const raw = await this.gemini.generateFromAudio(
        TRANSCRIBE_PROMPT,
        buffer,
        normalizedMime,
      );
      const transcript = cleanTranscript(raw);
      if (!transcript) {
        throw new BadRequestException(
          'Không nhận diện được giọng nói. Hãy thử nói rõ hơn hoặc kiểm tra micro.',
        );
      }
      return transcript;
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      this.logger.error(
        `STT thất bại: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new BadRequestException(
        'Không thể nhận diện giọng nói. Vui lòng thử lại.',
      );
    }
  }
}
