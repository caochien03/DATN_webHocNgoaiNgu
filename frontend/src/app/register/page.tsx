"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const body: { email: string; password: string; name?: string } = {
        email: email.trim().toLowerCase(),
        password,
      };
      if (name.trim()) body.name = name.trim();

      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as AuthResponse;
      if (!res.ok) {
        setError(parseAuthMessage(data, "Đăng ký thất bại"));
        return;
      }
      if (!data.accessToken || !data.user) {
        setError("Hệ thống nhận được phản hồi không hợp lệ. Vui lòng thử lại.");
        return;
      }
      setStoredAuth({ accessToken: data.accessToken, user: data.user });
      router.push("/");
      router.refresh();
    } catch {
      setError("Không thể kết nối đến hệ thống. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Miễn phí — mật khẩu tối thiểu 8 ký tự."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Đăng nhập
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
          <span className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} w-full pr-11`}
              placeholder="Ít nhất 8 ký tự"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Nhập lại mật khẩu</span>
          <span className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClass} w-full pr-11`}
              placeholder="Nhập lại mật khẩu"
              aria-invalid={passwordsMismatch}
              aria-describedby={passwordsMismatch ? "confirm-password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          {passwordsMismatch ? (
            <span id="confirm-password-error" className="text-xs text-destructive">
              Mật khẩu nhập lại không khớp.
            </span>
          ) : null}
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>
            Tên hiển thị{" "}
            <span className="font-normal text-muted-foreground/70">(tuỳ chọn)</span>
          </span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Tên bạn muốn hiển thị"
          />
        </label>
        {error ? <p className={errorBannerClass}>{error}</p> : null}
        <GradientButton
          type="submit"
          disabled={loading || passwordsMismatch}
          className="w-full py-2.5"
        >
          {loading ? "Đang xử lý…" : "Tạo tài khoản"}
        </GradientButton>
      </form>
    </AuthShell>
  );
}
