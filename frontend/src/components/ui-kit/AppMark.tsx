import { cn } from "@/lib/cn";
import { GRADIENT_DIAGONAL } from "./brand";

// ── Logo Vector SVG ────────────────────────────────────────
export function ChingoLogo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = "ch";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B6EFF" />
          <stop offset="100%" stopColor="#00C2FF" />
        </linearGradient>
        <linearGradient id={`${id}shine`} x1="0" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.22" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background — blue, consistent with app theme */}
      <rect width="40" height="40" rx="12" fill={`url(#${id}bg)`} />
      <rect width="40" height="40" rx="12" fill={`url(#${id}shine)`} />

      {/* "C" arc — open circle representing language/speech */}
      <path
        d="M28 10.5 A12 12 0 1 0 28 29.5"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Lightning bolt inside "C" — chiến = conquer/fight energy */}
      <path
        d="M22 13 L17.5 20.5 L21 20.5 L18 27 L24.5 18.5 L20.8 18.5 Z"
        fill="white"
      />
    </svg>
  );
}

// Aliases for compatibility
export const AppLogo = ChingoLogo;
export const LingoraLogo = ChingoLogo;
export const AppMark = ChingoLogo;

// ── Wordmark ───────────────────────────────────────────────
export function ChingoWordmark({
  dark = false,
  className,
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("font-extrabold text-base tracking-tight", className)}
      style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
    >
      <span className={dark ? "text-white" : "text-foreground"}>Chi</span>
      <span
        style={{
          background: "linear-gradient(90deg,#3B6EFF,#00C2FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        ngo
      </span>
    </span>
  );
}

export const AppWordmark = ChingoWordmark;
export const LingoraWordmark = ChingoWordmark;

// ── Avatar Circle ──────────────────────────────────────────
export function AvatarCircle({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full font-bold text-white",
        className,
      )}
      style={{ background: GRADIENT_DIAGONAL }}
    >
      {label}
    </span>
  );
}
