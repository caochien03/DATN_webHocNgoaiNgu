import { getApiUrl } from "./api-url";
import { getStoredAuth } from "./auth-storage";

export async function fetchWithAuth(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error("Chưa đăng nhập");
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${auth.accessToken}`);
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const base = getApiUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  return fetch(url, { ...init, headers });
}

export function recordAttempt(cardId: string, isCorrect: boolean): void {
  void fetchWithAuth(`/cards/${cardId}/attempt`, {
    method: "POST",
    body: JSON.stringify({ isCorrect }),
  }).catch(() => {
    /* bỏ qua lỗi ghi lịch sử học để không chặn luồng UI */
  });
}

export async function parseApiError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (typeof data.message === "string") return data.message;
  } catch {
    /* ignore */
  }
  return res.statusText || "Lỗi không xác định";
}
