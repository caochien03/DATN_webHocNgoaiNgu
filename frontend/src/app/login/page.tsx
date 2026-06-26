"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  errorBannerClass,
  inputClass,
  labelClass,
  labelTextClass,
} from "@/components/ui-kit/form-styles";
import { GradientButton } from "@/components/ui-kit/primitives";
import { parseAuthMessage, type AuthResponse } from "@/lib/auth-api";
import { getApiUrl } from "@/lib/api-url";
import { setStoredAuth } from "@/lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as AuthResponse;
      if (!res.ok) {
        setError(parseAuthMessage(data, "Đăng nhập thất bại"));
        return;
      }
      if (!data.accessToken || !data.user) {
        setError("Phản hồi không hợp lệ từ server.");
        return;
      }
      setStoredAuth({ accessToken: data.accessToken, user: data.user });
      router.push("/");
      router.refresh();
    } catch {
      setError("Không kết nối được API. Kiểm tra backend đã chạy chưa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Tiếp tục hành trình học tiếng Hàn của bạn."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Đăng ký
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className={labelClass}>
          <span className={labelTextClass}>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="ban@email.com"
          />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Mật khẩu</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </label>
        {error ? <p className={errorBannerClass}>{error}</p> : null}
        <GradientButton type="submit" disabled={loading} className="w-full py-2.5">
          {loading ? "Đang xử lý…" : "Đăng nhập"}
        </GradientButton>
      </form>
    </AuthShell>
  );
}
