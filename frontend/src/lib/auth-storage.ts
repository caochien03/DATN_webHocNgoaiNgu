"use client";

const KEY = "datn_auth";

export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type StoredAuth = {
  accessToken: string;
  user: AuthUser;
};

/** Sessions saved before role existed default to USER. */
export function normalizeAuthUser(
  user: Omit<AuthUser, "role"> & { role?: UserRole | string | null },
): AuthUser {
  return {
    ...user,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  };
}

export function isAdminUser(user: Pick<AuthUser, "role"> | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    return {
      accessToken: parsed.accessToken,
      user: normalizeAuthUser(parsed.user),
    };
  } catch {
    return null;
  }
}

function notifyAuthChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("datn-auth"));
}

export function setStoredAuth(data: StoredAuth): void {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      accessToken: data.accessToken,
      user: normalizeAuthUser(data.user),
    }),
  );
  notifyAuthChange();
}

export function clearStoredAuth(): void {
  localStorage.removeItem(KEY);
  notifyAuthChange();
}
