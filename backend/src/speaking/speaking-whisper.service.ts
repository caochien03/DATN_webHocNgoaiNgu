import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateSpeakingAudio, cleanTranscript } from './speaking-audio';

/**
 * Dịch vụ nhận diện giọng nói dùng OpenAI Whisper API.
 * Nhận audio Buffer → trả về transcript văn bản.
 */
@Injectable()
export class SpeakingWhisperService {
  private readonly logger = new Logger(SpeakingWhisperService.name);
  private readonly apiKey: string | null;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENAI_API_KEY') ?? null;
    if (!this.apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY chưa cấu hình — STT sẽ dùng Gemini audio fallback.',
      );
    }
  }

  get enabled(): boolean {
    return this.apiKey != null;
  }

  assertEnabled(): void {
    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        'Tính năng nhận diện giọng nói (Whisper) chưa được cấu hình (thiếu OPENAI_API_KEY).',
      );
    }
  }

  /**
   * Chuyển đổi file audio thành văn bản bằng OpenAI Whisper API.
   * @param buffer - Dữ liệu audio nhị phân
   * @param mimeType - MIME type của audio (audio/webm, audio/mp4…)
   * @param language - Mã ngôn ngữ BCP-47 (ko, en, …) để tăng độ chính xác
   */
  async transcribe(
    buffer: Buffer,
    mimeType: string | undefined,
    language?: string,
  ): Promise<string> {
    this.assertEnabled();

    let normalizedMime: string;
    try {
      normalizedMime = validateSpeakingAudio(buffer, mimeType);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Audio không hợp lệ.',
      );
    }

    // Xác định đuôi file từ MIME type
    const ext = normalizedMime.includes('webm')
      ? 'webm'
      : normalizedMime.includes('mp4') || normalizedMime.includes('m4a')
        ? 'mp4'
        : normalizedMime.includes('ogg')
          ? 'ogg'
          : 'webm';

    const form = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: normalizedMime });
    form.append('file', blob, `audio.${ext}`);
    form.append('model', 'whisper-1');
    form.append('response_format', 'text');
    if (language) {
      form.append('language', language);
    }

    try {
      const response = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.apiKey}` },
          body: form,
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(
          `Whisper API thất bại (${response.status}): ${errText}`,
        );
        throw new BadRequestException(
          'Không thể nhận diện giọng nói. Vui lòng thử lại.',
        );
      }

      const raw = await response.text();
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
        `Whisper STT thất bại: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new BadRequestException(
        'Không thể nhận diện giọng nói. Vui lòng thử lại.',
      );
    }
  }
}
