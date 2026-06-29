"use client";

import { useEffect, useRef } from "react";
import type { SpeakingTurnRow } from "@/lib/types";
import { speakKorean, warmUpKoreanTts } from "@/lib/korean-tts";
import { SpeakKoreanButton } from "./SpeakKoreanButton";
import { SpeakingTurnFeedback } from "./SpeakingTurnFeedback";

export function SpeakingChat({
  turns,
  autoSpeakLatestNpc = false,
  showGrading = false,
}: {
  turns: SpeakingTurnRow[];
  autoSpeakLatestNpc?: boolean;
  showGrading?: boolean;
}) {
  const lastSpokenId = useRef<string | null>(null);

  useEffect(() => {
    warmUpKoreanTts();
  }, []);

  useEffect(() => {
    if (!autoSpeakLatestNpc || turns.length === 0) return;
    const last = turns[turns.length - 1];
    if (last.speaker !== "NPC" || last.id === lastSpokenId.current) return;
    lastSpokenId.current = last.id;
    speakKorean(last.text);
  }, [turns, autoSpeakLatestNpc]);

  if (turns.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Chưa có hội thoại.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {turns.map((turn) => {
        const isUser = turn.speaker === "USER";
        return (
          <div
            key={turn.id}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div
              className={`mb-1 flex items-center gap-2 ${isUser ? "flex-row-reverse" : ""}`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {isUser ? "Bạn" : "NPC"}
              </span>
              {!isUser ? <SpeakKoreanButton text={turn.text} /> : null}
            </div>
            <div
              className={`max-w-[92%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isUser
                  ? "rounded-br-md bg-primary/15 text-foreground"
                  : "rounded-bl-md border border-border bg-muted/40 text-foreground"
              }`}
            >
              {turn.text}
            </div>
            {showGrading && isUser && turn.grading ? (
              <div className="mt-1 w-full max-w-[92%]">
                <SpeakingTurnFeedback grading={turn.grading} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
