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

/** Đọc câu tiếng Hàn bằng giọng hệ thống (Web Speech API). */
export function speakKorean(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || !isKoreanTtsSupported()) return false;

  stopKoreanSpeech();

  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = "ko-KR";
  utter.rate = 0.92;
  utter.pitch = 1;

  const voice = pickKoreanVoice();
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
  return true;
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
