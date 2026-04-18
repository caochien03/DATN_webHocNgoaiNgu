"use client";

const KEY = "datn_auth";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredAuth = {
  accessToken: string;
  user: AuthUser;
};

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function notifyAuthChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("datn-auth"));
}

export function setStoredAuth(data: StoredAuth): void {
  localStorage.setItem(KEY, JSON.stringify(data));
  notifyAuthChange();
}

export function clearStoredAuth(): void {
  localStorage.removeItem(KEY);
  notifyAuthChange();
}
