import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ── LRU Cache in-memory (không cần external dependency) ─────────────────────
class LRUCache<K, V> {
  private readonly map = new Map<K, V>();
  constructor(private readonly maxSize: number) {}

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.maxSize) {
      const firstKey = this.map.keys().next().value as K | undefined;
      if (firstKey !== undefined) this.map.delete(firstKey);
    }
    this.map.set(key, value);
  }
}
// ────────────────────────────────────────────────────────────────────────────

// Google Cloud TTS REST API — không cần SDK, chỉ cần API key
const GCP_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// Giọng Neural2 chuẩn cho từng ngôn ngữ
const VOICE_CONFIG: Record<string, { languageCode: string; name: string }> = {
  ko: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-C' },
  en: { languageCode: 'en-US', name: 'en-US-Neural2-F' },
};

const DEFAULT_LANG = 'ko';

@Injectable()
export class SpeakingTtsService {
  private readonly logger = new Logger(SpeakingTtsService.name);
  private readonly apiKey: string | null;
  // Cache in-memory: key = "lang:text", value = base64 audio
  private readonly cache = new LRUCache<string, string>(200);

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GCP_TTS_API_KEY') ?? null;
    if (!this.apiKey) {
      this.logger.warn(
        'GCP_TTS_API_KEY chưa cấu hình — TTS phía Server không khả dụng.',
      );
    }
  }

  get enabled(): boolean {
    return this.apiKey != null;
  }

  /**
   * Tổng hợp giọng nói, trả về Buffer MP3.
   * Kết quả được cache in-memory để giảm lượt gọi API.
   */
  async synthesize(text: string, languageCode = DEFAULT_LANG): Promise<Buffer> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        'Tính năng TTS phía Server chưa được cấu hình (thiếu GCP_TTS_API_KEY).',
      );
    }

    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Văn bản trống, không thể tổng hợp giọng nói.');
    }

    const cacheKey = `${languageCode}:${trimmed}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return Buffer.from(cached, 'base64');
    }

    const voice = VOICE_CONFIG[languageCode] ?? VOICE_CONFIG[DEFAULT_LANG];

    const body = {
      input: { text: trimmed },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95,
        pitch: 0,
      },
    };

    const response = await fetch(`${GCP_TTS_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Google Cloud TTS thất bại: ${err}`);
      throw new ServiceUnavailableException(
        'Không thể tổng hợp giọng nói. Vui lòng thử lại.',
      );
    }

    const json = (await response.json()) as { audioContent: string };
    const audioBase64 = json.audioContent;

    this.cache.set(cacheKey, audioBase64);
    return Buffer.from(audioBase64, 'base64');
  }
}
