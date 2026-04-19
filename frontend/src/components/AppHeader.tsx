"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  type AuthUser,
} from "@/lib/auth-storage";

export function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    function sync() {
      setUser(getStoredAuth()?.user ?? null);
    }
    sync();
    window.addEventListener("datn-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("datn-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function logout() {
    clearStoredAuth();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          DATN · Học ngoại ngữ
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/topics"
                className="text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Chủ đề
              </Link>
              <Link
                href="/grammar"
                className="text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Ngữ pháp
              </Link>
              <Link
                href="/decks"
                className="text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Bộ từ
              </Link>
              <Link
                href="/me"
                className="max-w-[140px] truncate text-zinc-700 hover:underline dark:text-zinc-300"
              >
                {user.name || user.email}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
