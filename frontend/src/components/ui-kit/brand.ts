export const BRAND = {
  blue: "#F97316",    // Warm orange (primary action)
  cyan: "#FBBF24",    // Warm amber (secondary / gradient end)
  green: "#34D399",   // Mint green (success)
  yellow: "#FCD34D",  // Sunny yellow (highlight)
  purple: "#C084FC",  // Soft purple (exam/topik)
  red: "#FB7185",     // Soft coral red (error)
  muted: "#92867A",   // Warm grey-brown (muted text)
} as const;

/** Tên và metadata ứng dụng — sửa tại đây để đổi toàn app */
export const APP = {
  name: "LinguaPal",
  tagline: "Học ngoại ngữ thông minh",
  description: "Nền tảng học đa ngôn ngữ theo lộ trình cá nhân hóa",
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
    A1: "#34D399",
    A2: "#2DD4BF",
    B1: "#60A5FA",
    B2: "#818CF8",
    C1: "#C084FC",
    C2: "#F472B6",
    TOPIK_I: "#34D399",
    TOPIK_II: "#2DD4BF",
    "TOPIK 1": "#34D399",
    "TOPIK 2": "#2DD4BF",
    "TOPIK 3": "#60A5FA",
    "TOPIK 4": "#818CF8",
    "TOPIK 5": "#C084FC",
    "TOPIK 6": "#F472B6",
  };
  return map[level] || BRAND.muted;
}

export function scoreColor(score: number) {
  if (score >= 90) return BRAND.green;
  if (score >= 70) return BRAND.yellow;
  return BRAND.red;
}
