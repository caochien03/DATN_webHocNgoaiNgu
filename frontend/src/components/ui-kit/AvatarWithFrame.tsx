"use client";

import { cn } from "@/lib/cn";
import { GRADIENT_DIAGONAL } from "@/components/ui-kit/brand";

const AVATAR_PRESETS: Record<string, string> = {
  "preset:fox": "🦊",
  "preset:cat": "🐱",
  "preset:dog": "🐶",
  "preset:student_boy": "🧑‍🎓",
  "preset:student_girl": "👩‍🎓",
  "preset:robot": "🤖",
};

export const PRESET_LIST = [
  { id: "preset:fox", emoji: "🦊", label: "Bé Cáo Thông Thái" },
  { id: "preset:cat", emoji: "🐱", label: "Mèo Con Chăm Chỉ" },
  { id: "preset:dog", emoji: "🐶", label: "Cún Con Năng Động" },
  { id: "preset:student_boy", emoji: "🧑‍🎓", label: "Học Sinh Hàn Quốc" },
  { id: "preset:student_girl", emoji: "👩‍🎓", label: "Nữ Sinh Dễ Thương" },
  { id: "preset:robot", emoji: "🤖", label: "Robot Gia Sư AI" },
];

type FrameId = "DEFAULT" | "FIRE_STREAK" | "DIAMOND_XP" | "ROYAL_CROWN" | "SQUAD_BRONZE" | "SQUAD_SILVER" | "SQUAD_GOLD" | "SQUAD_DIAMOND";

const FRAME_STYLES: Record<FrameId, string> = {
  DEFAULT: "ring-[3px] ring-primary/30",
  FIRE_STREAK: "ring-[3px] ring-orange-500/60 shadow-[0_0_18px_2px_rgba(249,115,22,0.35)]",
  DIAMOND_XP: "ring-[3px] ring-blue-400/60 shadow-[0_0_18px_2px_rgba(96,165,250,0.35)]",
  ROYAL_CROWN: "ring-[3px] ring-yellow-400/60 shadow-[0_0_18px_2px_rgba(250,204,21,0.35)]",
  SQUAD_BRONZE: "ring-[4px] ring-orange-700/80 ring-offset-[3px] ring-offset-orange-900/30 shadow-[0_0_20px_5px_rgba(194,65,12,0.4)]",
  SQUAD_SILVER: "ring-[4px] ring-slate-300/90 ring-offset-[3px] ring-offset-slate-500/40 shadow-[0_0_25px_6px_rgba(148,163,184,0.6)]",
  SQUAD_GOLD: "ring-[4px] ring-yellow-400/90 ring-offset-[3px] ring-offset-yellow-600/50 shadow-[0_0_30px_8px_rgba(234,179,8,0.7)]",
  SQUAD_DIAMOND: "ring-[4px] ring-cyan-300/90 ring-offset-[3px] ring-offset-cyan-500/60 shadow-[0_0_40px_10px_rgba(34,211,238,0.8)]",
};

const FRAME_ANIMATION: Record<FrameId, React.CSSProperties> = {
  DEFAULT: {},
  FIRE_STREAK: {
    animation: "pulse 2s ease-in-out infinite",
    background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.08))",
  },
  DIAMOND_XP: {
    animation: "pulse 2.5s ease-in-out infinite",
    background: "linear-gradient(135deg, rgba(96,165,250,0.12), rgba(59,130,246,0.08))",
  },
  ROYAL_CROWN: {
    animation: "pulse 3s ease-in-out infinite",
    background: "linear-gradient(135deg, rgba(250,204,21,0.12), rgba(234,179,8,0.08))",
  },
  SQUAD_BRONZE: {
    animation: "pulse 3s ease-in-out infinite",
    background: "linear-gradient(135deg, rgba(194,65,12,0.15), rgba(154,52,18,0.1))",
  },
  SQUAD_SILVER: {
    animation: "pulse 2.5s ease-in-out infinite",
    background: "linear-gradient(135deg, rgba(203,213,225,0.2), rgba(148,163,184,0.15))",
  },
  SQUAD_GOLD: {
    animation: "pulse 2s ease-in-out infinite",
    background: "linear-gradient(135deg, rgba(250,204,21,0.25), rgba(202,138,4,0.15))",
  },
  SQUAD_DIAMOND: {
    animation: "pulse 1.2s ease-in-out infinite",
    background: "linear-gradient(135deg, rgba(34,211,238,0.3), rgba(6,182,212,0.2))",
    boxShadow: "inset 0 0 20px rgba(34,211,238,0.6)",
  },
};

export function AvatarWithFrame({
  avatarUrl,
  frame = "DEFAULT",
  fallbackInitial,
  size = 80,
  className,
}: {
  avatarUrl: string | null | undefined;
  frame?: string | null;
  fallbackInitial: string;
  size?: number;
  className?: string;
}) {
  const frameId = (frame ?? "DEFAULT") as FrameId;
  const frameClass = FRAME_STYLES[frameId] ?? FRAME_STYLES.DEFAULT;
  const frameAnim = FRAME_ANIMATION[frameId] ?? {};
  const isPreset = avatarUrl?.startsWith("preset:");
  const presetEmoji = isPreset ? AVATAR_PRESETS[avatarUrl!] : null;
  const isImage = avatarUrl && !isPreset;

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full transition-all duration-300",
          frameClass,
        )}
        style={{
          width: size,
          height: size,
          ...frameAnim,
        }}
      >
        {isImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-full w-full rounded-full object-cover"
          />
        ) : presetEmoji ? (
          <span
            className="flex items-center justify-center rounded-full"
            style={{
              width: size,
              height: size,
              fontSize: size * 0.5,
              background: "var(--secondary)",
            }}
          >
            {presetEmoji}
          </span>
        ) : (
          <span
            className="flex items-center justify-center rounded-full font-black text-white"
            style={{
              width: size,
              height: size,
              fontSize: size * 0.38,
              background: GRADIENT_DIAGONAL,
            }}
          >
            {fallbackInitial}
          </span>
        )}
      </div>

      {/* Crown icon overlay for ROYAL_CROWN */}
      {frameId === "ROYAL_CROWN" ? (
        <span
          className="absolute -right-1 -top-1 text-sm drop-shadow-sm"
          style={{ fontSize: size * 0.25 }}
        >
          👑
        </span>
      ) : null}
    </div>
  );
}
