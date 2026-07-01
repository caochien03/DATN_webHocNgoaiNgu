let preferredVoice: SpeechSynthesisVoice | null | undefined;

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (preferredVoice !== undefined) return preferredVoice;
  const voices = getVoices();
  preferredVoice =
    voices.find((v) => v.lang === "ko-KR") ??
    voices.find((v) => v.lang.startsWith("ko")) ??
    null;
  return preferredVoice;
}

export function isKoreanTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopKoreanSpeech(): void {
  if (!isKoreanTtsSupported()) return;
  window.speechSynthesis.cancel();
}

/** BCP-47 cho Web Speech theo ngôn ngữ học. */
const SPEECH_LANG: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
};

export function speakLearningLanguage(text: string, languageCode = "ko"): boolean {
  const trimmed = text.trim();
  if (!trimmed || !isKoreanTtsSupported()) return false;

  stopKoreanSpeech();

  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = SPEECH_LANG[languageCode] ?? SPEECH_LANG.ko;
  utter.rate = 0.92;
  utter.pitch = 1;

  const voices = getVoices();
  const prefix = utter.lang.split("-")[0];
  const voice =
    voices.find((v) => v.lang === utter.lang) ??
    voices.find((v) => v.lang.startsWith(prefix)) ??
    null;
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
  return true;
}

/** Đọc câu tiếng Hàn bằng giọng hệ thống (Web Speech API). */
export function speakKorean(text: string): boolean {
  return speakLearningLanguage(text, "ko");
}

/** Gọi sau mount để nạp danh sách voice (Safari / Chrome). */
export function warmUpKoreanTts(): void {
  if (!isKoreanTtsSupported()) return;
  void getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = undefined;
    pickKoreanVoice();
  };
}
