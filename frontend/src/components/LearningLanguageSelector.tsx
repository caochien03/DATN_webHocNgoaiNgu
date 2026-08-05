"use client";

import { motion } from "motion/react";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { type LearningLanguageCode } from "@/lib/learning-language";
import { cn } from "@/lib/cn";
import { BRAND } from "@/components/ui-kit/brand";

const LANGS: { code: LearningLanguageCode; label: string; flag: string }[] = [
  { code: "ko", label: "Tiếng Hàn", flag: "🇰🇷" },
  { code: "en", label: "Tiếng Anh", flag: "🇬🇧" },
];

export function LearningLanguageSelector({ className }: { className?: string }) {
  const { languageCode, setActive } = useLearningLanguage();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-border bg-secondary/80 p-1 shadow-2xs",
        className,
      )}
    >
      {LANGS.map((lang) => {
        const isActive = languageCode === lang.code;
        return (
          <motion.button
            key={lang.code}
            type="button"
            onClick={() => void setActive(lang.code)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap",
              isActive ? "text-white" : "text-muted-foreground hover:text-foreground",
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isActive && (
              <motion.div
                layoutId="topbar-lang-pill"
                className="absolute inset-0 rounded-lg shadow-xs"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10 text-sm leading-none">{lang.flag}</span>
            <span className="relative z-10">{lang.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
