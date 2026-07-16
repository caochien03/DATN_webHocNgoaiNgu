/**
 * TTS (Text-to-Speech) helper cho tính năng luyện nói.
 *
 * Chiến lược:
 * 1. Thử gọi Server TTS (Google Cloud Neural2) trước — chất lượng cao nhất.
 * 2. Nếu Server TTS không cấu hình (503) hoặc lỗi → fallback sang Web Speech API.
 */

import { fetchWithAuth } from './api-fetch';


// ────────────────────────────────────────────────────
// Server TTS (Google Cloud TTS Neural2 qua Backend)
// ────────────────────────────────────────────────────

let serverTtsAvailable: boolean | null = null; // null = chưa kiểm tra
let currentAudio: HTMLAudioElement | null = null;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

async function speakFromServer(
  text: string,
  languageCode: string,
  onEnd?: () => void,
): Promise<boolean> {
  try {
    const res = await fetchWithAuth('/speaking/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, languageCode }),
    });

    if (!res.ok) {
      if (res.status === 503) serverTtsAvailable = false;
      return false;
    }

    serverTtsAvailable = true;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    stopCurrentAudio();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
      onEnd?.();
    };
    void audio.play();
    return true;
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────────────
// Web Speech API fallback
// ────────────────────────────────────────────────────

let preferredVoice: SpeechSynthesisVoice | null | undefined;

const SPEECH_LANG: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
};

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function speakFromWebSpeech(text: string, languageCode = 'ko', onEnd?: () => void): boolean {
  const trimmed = text.trim();
  if (!trimmed || !isWebSpeechSupported()) return false;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = SPEECH_LANG[languageCode] ?? SPEECH_LANG.ko;
  utter.rate = 0.92;
  utter.pitch = 1;

  const voices = getVoices();
  const prefix = utter.lang.split('-')[0];
  const voice =
    voices.find((v) => v.lang === utter.lang) ??
    voices.find((v) => v.lang.startsWith(prefix)) ??
    null;
  if (voice) utter.voice = voice;

  if (onEnd) utter.onend = () => onEnd();

  window.speechSynthesis.speak(utter);
  return true;
}

// ────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────

export function stopSpeech(): void {
  stopCurrentAudio();
  if (isWebSpeechSupported()) window.speechSynthesis.cancel();
}

/**
 * Đọc văn bản bằng ngôn ngữ đang học.
 * Tự động chọn Server TTS (Neural2) hoặc fallback Web Speech API.
 */
export async function speakLearningLanguage(
  text: string,
  languageCode = 'ko',
  onEnd?: () => void,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    onEnd?.();
    return;
  }

  stopSpeech();

  if (serverTtsAvailable === false) {
    speakFromWebSpeech(trimmed, languageCode, onEnd);
    return;
  }

  const ok = await speakFromServer(trimmed, languageCode, onEnd);
  if (!ok) {
    speakFromWebSpeech(trimmed, languageCode, onEnd);
  }
}

/** Đọc tiếng Hàn (backward-compat). */
export async function speakKorean(text: string): Promise<void> {
  return speakLearningLanguage(text, 'ko');
}

/** Gọi sau mount để nạp danh sách voice cho Web Speech (Safari/Chrome). */
export function warmUpKoreanTts(): void {
  if (!isWebSpeechSupported()) return;
  void getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = undefined;
  };
}
