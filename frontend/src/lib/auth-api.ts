import type { AuthUser } from "@/lib/auth-storage";

export type AuthResponse = {
  accessToken?: string;
  user?: AuthUser;
  message?: string | string[];
};

export function parseAuthMessage(
  data: AuthResponse,
  fallback: string,
): string {
  const msg = data.message;
  return Array.isArray(msg) ? msg.join(", ") : (msg ?? fallback);
}
