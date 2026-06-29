"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  isKoreanTtsSupported,
  speakKorean,
  warmUpKoreanTts,
} from "@/lib/korean-tts";

export function SpeakKoreanButton({
  text,
  label = "Nghe",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    warmUpKoreanTts();
    setSupported(isKoreanTtsSupported());
  }, []);

  if (!supported || !text.trim()) return null;

  return (
    <button
      type="button"
      onClick={() => speakKorean(text)}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground ${className}`}
      title="Nghe câu tiếng Hàn"
    >
      <Volume2 size={14} />
      {label}
    </button>
  );
}
