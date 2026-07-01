"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import {
  LEARNING_LANGUAGE_OPTIONS,
  learningLanguageLabel,
  type LearningLanguageCode,
} from "@/lib/learning-language";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

export function LearningLanguageSelector({ className }: { className?: string }) {
  const { languageCode, languages, setActive } = useLearningLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const enrolled = new Set(languages.map((l) => l.languageCode));
  const options = LEARNING_LANGUAGE_OPTIONS.filter((o) => enrolled.has(o.code));

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function pick(code: LearningLanguageCode) {
    setOpen(false);
    if (code !== languageCode) await setActive(code);
  }

  if (options.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-1.5 text-sm text-muted-foreground",
          className,
        )}
      >
        <Globe size={14} />
        {learningLanguageLabel(languageCode)}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
      >
        <Globe size={14} className="text-muted-foreground" />
        <span className="hidden sm:inline text-muted-foreground">Đang học:</span>
        {learningLanguageLabel(languageCode)}
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-xl border border-border bg-card py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => void pick(opt.code)}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                opt.code === languageCode
                  ? "font-semibold text-primary"
                  : "text-foreground",
              )}
            >
              {opt.nameVi}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
