import { GoogleGenAI } from '@google/genai';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_MODEL = 'gemini-2.0-flash';

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

  async generateText(prompt: string): Promise<string> {
    this.assertEnabled();
    const response = await this.client!.models.generateContent({
      model: this.model,
      contents: prompt,
    });
    return response.text ?? '';
  }

  async generateFromAudio(
    prompt: string,
    audio: Buffer,
    mimeType: string,
  ): Promise<string> {
    this.assertEnabled();
    const response = await this.client!.models.generateContent({
      model: this.model,
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
  }
}
