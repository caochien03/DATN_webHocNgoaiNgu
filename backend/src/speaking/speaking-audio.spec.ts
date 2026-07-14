import {
  cleanTranscript,
  normalizeAudioMimeType,
  SPEAKING_MAX_AUDIO_BYTES,
  SPEAKING_MIN_AUDIO_BYTES,
  validateSpeakingAudio,
} from './speaking-audio';

describe('speaking-audio', () => {
  it('normalizes common mime aliases', () => {
    expect(normalizeAudioMimeType('audio/webm;codecs=opus')).toBe('audio/webm');
    expect(normalizeAudioMimeType('audio/mp3')).toBe('audio/mpeg');
  });

  it('accepts valid audio buffer', () => {
    const buf = Buffer.alloc(SPEAKING_MIN_AUDIO_BYTES + 1, 1);
    expect(validateSpeakingAudio(buf, 'audio/webm')).toBe('audio/webm');
  });

  it('rejects empty or too large audio', () => {
    expect(() => validateSpeakingAudio(Buffer.alloc(10), 'audio/webm')).toThrow(
      /quá ngắn/,
    );
    expect(() =>
      validateSpeakingAudio(
        Buffer.alloc(SPEAKING_MAX_AUDIO_BYTES + 1),
        'audio/webm',
      ),
    ).toThrow(/quá lớn/);
  });

  it('rejects unsupported mime type', () => {
    const buf = Buffer.alloc(SPEAKING_MIN_AUDIO_BYTES + 1, 1);
    expect(() => validateSpeakingAudio(buf, 'video/mp4')).toThrow(
      /không hỗ trợ/,
    );
  });

  it('cleans fenced transcript', () => {
    expect(cleanTranscript('```\n안녕하세요\n```')).toBe('안녕하세요');
    expect(cleanTranscript('Transcript: 네 명이에요')).toBe('네 명이에요');
  });
});
