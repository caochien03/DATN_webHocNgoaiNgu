import { GoogleGenAI } from '@google/genai';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_MODEL = 'gemini-2.0-flash';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class SpeakingGeminiService {
  private readonly logger = new Logger(SpeakingGeminiService.name);
  private readonly client: GoogleGenAI | null;
  readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.model = this.config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn(
        'GEMINI_API_KEY chưa cấu hình — tính năng luyện nói sẽ không khả dụng.',
      );
    }
  }

  get enabled(): boolean {
    return this.client != null;
  }

  assertEnabled(): void {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Tính năng luyện nói AI chưa được cấu hình (thiếu GEMINI_API_KEY).',
      );
    }
  }

  private getCandidateModels(): string[] {
    const primary = this.model;
    const candidates = [primary, 'gemini-2.0-flash', 'gemini-1.5-flash'];
    return Array.from(new Set(candidates));
  }

  async generateText(prompt: string): Promise<string> {
    this.assertEnabled();
    const models = this.getCandidateModels();
    let lastError: unknown;

    for (const m of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await this.client!.models.generateContent({
            model: m,
            contents: prompt,
          });
          return response.text ?? '';
        } catch (e) {
          lastError = e;
          const isRateLimit =
            String(e).includes('429') || String(e).includes('RESOURCE_EXHAUSTED');
          if (isRateLimit && attempt === 1) {
            this.logger.warn(
              `Model ${m} gặp 429 (lần 1), đợi 1.2s thử lại...`,
            );
            await sleep(1200);
            continue;
          }
          this.logger.warn(`Model ${m} thất bại, chuyển model khác...`);
          break;
        }
      }
    }

    throw lastError;
  }

  async generateFromAudio(
    prompt: string,
    audio: Buffer,
    mimeType: string,
  ): Promise<string> {
    this.assertEnabled();
    const models = this.getCandidateModels();
    let lastError: unknown;

    for (const m of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await this.client!.models.generateContent({
            model: m,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: audio.toString('base64'),
                    },
                  },
                  { text: prompt },
                ],
              },
            ],
          });
          return response.text ?? '';
        } catch (e) {
          lastError = e;
          const isRateLimit =
            String(e).includes('429') || String(e).includes('RESOURCE_EXHAUSTED');
          if (isRateLimit && attempt === 1) {
            this.logger.warn(
              `Audio model ${m} gặp 429 (lần 1), đợi 1.2s thử lại...`,
            );
            await sleep(1200);
            continue;
          }
          this.logger.warn(`Audio model ${m} thất bại, chuyển model khác...`);
          break;
        }
      }
    }

    throw lastError;
  }
}
