"use client";

import { useEffect, useState } from "react";
import { Mail, Shield, UserRound } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { AvatarCircle } from "@/components/ui-kit/AppMark";
import { GRADIENT } from "@/components/ui-kit/brand";
import { errorClass, inputClass } from "@/components/ui-kit/form-styles";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import {
  getStoredAuth,
  setStoredAuth,
  type AuthUser,
} from "@/lib/auth-storage";

function ProfileContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getStoredAuth()?.user ?? null;
    setUser(u);
    setName(u?.name ?? "");
  }, []);

  if (!user) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        Không đọc được hồ sơ.
      </p>
    );
  }

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
    : "—";
  const initial = (user.name || user.email).charAt(0).toUpperCase();
  const isAdmin = user.role === "ADMIN";

  async function saveProfile() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetchWithAuth("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const updated = (await res.json()) as AuthUser;
      const auth = getStoredAuth();
      if (auth) setStoredAuth({ accessToken: auth.accessToken, user: updated });
      setUser(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được hồ sơ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Hồ sơ" sub="Thông tin tài khoản và cài đặt" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center">
          <AvatarCircle label={initial} className="mb-4 h-20 w-20 text-3xl" />
          <p className="text-lg font-bold text-foreground">
            {user.name || "(chưa đặt tên)"}
          </p>
          <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Shield size={12} />
            <span>{isAdmin ? "ADMIN" : "USER"}</span>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">Thông tin tài khoản</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 border-b border-border py-2 sm:border-0">
                <Mail size={15} className="mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="break-all text-sm text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 py-2">
                <UserRound size={15} className="mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tham gia</p>
                  <p className="text-sm text-foreground">{createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">Sửa hồ sơ</h3>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Tên hiển thị
            </label>
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                placeholder="Nhập tên hiển thị"
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => void saveProfile()}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: GRADIENT }}
              >
                {saving ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
            {error ? <p className={`mt-2 ${errorClass}`}>{error}</p> : null}
            {saved ? (
              <p className="mt-2 text-sm text-emerald-300">Đã lưu thay đổi.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileContent />
    </AuthGate>
  );
}
