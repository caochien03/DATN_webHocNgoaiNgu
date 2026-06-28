/** Giới hạn upload audio cho STT (dưới ngưỡng 20MB của Gemini). */
export const SPEAKING_MAX_AUDIO_BYTES = 5 * 1024 * 1024;

export const SPEAKING_MIN_AUDIO_BYTES = 256;

const ALLOWED_MIME_PREFIXES = ['audio/'] as const;

const MIME_ALIASES: Record<string, string> = {
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/mp3': 'audio/mpeg',
  'video/webm': 'audio/webm',
};

export function normalizeAudioMimeType(mimeType: string | undefined): string {
  const raw = (mimeType ?? 'audio/webm').split(';')[0].trim().toLowerCase();
  return MIME_ALIASES[raw] ?? raw;
}

export function isAllowedAudioMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

export function validateSpeakingAudio(
  buffer: Buffer,
  mimeType: string | undefined,
): string {
  if (!buffer || buffer.length < SPEAKING_MIN_AUDIO_BYTES) {
    throw new Error('Audio quá ngắn hoặc trống. Hãy ghi âm dài hơn.');
  }
  if (buffer.length > SPEAKING_MAX_AUDIO_BYTES) {
    throw new Error('File audio quá lớn (tối đa 5MB).');
  }
  const normalized = normalizeAudioMimeType(mimeType);
  if (!isAllowedAudioMimeType(normalized)) {
    throw new Error(`Định dạng audio không hỗ trợ: ${normalized}`);
  }
  return normalized;
}

/** Loại bỏ markdown / nhãn thừa từ transcript STT. */
export function cleanTranscript(text: string): string {
  let t = text.trim();
  const fenced = t.match(/^```[\s\S]*?\n([\s\S]*?)```$/);
  if (fenced) t = fenced[1].trim();
  t = t.replace(/^transcript:\s*/i, '').trim();
  return t;
}
