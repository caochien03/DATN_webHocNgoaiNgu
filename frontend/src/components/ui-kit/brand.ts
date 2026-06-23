export const BRAND = {
  blue: "#3B6EFF",
  cyan: "#00C2FF",
  green: "#34D399",
  yellow: "#FFD93D",
  purple: "#A78BFA",
  red: "#F87171",
  muted: "#7480A0",
} as const;

export const GRADIENT = `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})`;

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
