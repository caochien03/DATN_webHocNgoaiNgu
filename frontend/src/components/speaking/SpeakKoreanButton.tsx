"use client";

import { Volume2 } from "lucide-react";
import { speakLearningLanguage, warmUpKoreanTts } from "@/lib/korean-tts";
import { useEffect } from "react";

export function SpeakKoreanButton({
  text,
  languageCode = "ko",
  label = "Nghe",
  className = "",
}: {
  text: string;
  languageCode?: string;
  label?: string;
  className?: string;
}) {
  useEffect(() => {
    warmUpKoreanTts();
  }, []);

  if (!text.trim()) return null;

  return (
    <button
      type="button"
      onClick={() => void speakLearningLanguage(text, languageCode)}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground ${className}`}
      title="Nghe câu NPC"
    >
      <Volume2 size={14} />
      {label}
    </button>
  );
}
