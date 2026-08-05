export const BRAND = {
  blue: "#3B6EFF",    // Sapphire SaaS Blue (primary action)
  cyan: "#00C2FF",    // Radiant Cyan (secondary / gradient accent)
  green: "#059669",   // Emerald green (success)
  yellow: "#D97706",  // Amber (streak & highlights)
  purple: "#7C3AED",  // Purple (grammar / speaking / AI)
  red: "#DC2626",     // Red (error / weak flashcards)
  muted: "#64748B",   // Slate muted text
} as const;

/** Tên và metadata ứng dụng — sửa tại đây để đổi toàn app */
export const APP = {
  name: "Chingo",
  tagline: "Học ngoại ngữ thông minh",
  description: "Nền tảng học đa ngôn ngữ theo lộ trình cá nhân hóa với AI và SRS",
  logo: "/logo.png",
} as const;

export const GRADIENT = `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})`;
export const GRADIENT_DIAGONAL = `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`;

export function pct(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function levelColor(level: string): string {
  const map: Record<string, string> = {
    A1: "#059669",
    A2: "#00C2FF",
    B1: "#3B6EFF",
    B2: "#6366F1",
    C1: "#7C3AED",
    C2: "#DB2777",
    TOPIK_I: "#059669",
    TOPIK_II: "#3B6EFF",
    "TOPIK 1": "#059669",
    "TOPIK 2": "#00C2FF",
    "TOPIK 3": "#3B6EFF",
    "TOPIK 4": "#6366F1",
    "TOPIK 5": "#7C3AED",
    "TOPIK 6": "#DB2777",
  };
  return map[level] || BRAND.muted;
}

export function scoreColor(score: number) {
  if (score >= 90) return BRAND.green;
  if (score >= 70) return BRAND.yellow;
  return BRAND.red;
}
