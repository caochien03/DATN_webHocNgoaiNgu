"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  isAdminUser,
  type AuthUser,
} from "@/lib/auth-storage";

const moreLinkClass =
  "block rounded px-2 py-1.5 text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (moreRef.current?.contains(e.target as Node)) return;
      setMoreOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [moreOpen]);

  function logout() {
    setMoreOpen(false);
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
                href="/paths"
                className="text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Lộ trình
              </Link>
              <Link href="/decks" className="text-zinc-700 hover:underline dark:text-zinc-300">
                Bộ từ
              </Link>
              <Link
                href="/review/today"
                className="text-zinc-700 hover:underline dark:text-zinc-300"
              >
                Ôn hôm nay
              </Link>
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className="text-zinc-700 hover:underline dark:text-zinc-300"
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                >
                  Thêm
                </button>
                {moreOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <Link
                      href="/lessons"
                      role="menuitem"
                      className={moreLinkClass}
                      onClick={() => setMoreOpen(false)}
                    >
                      Bài học
                    </Link>
                    <Link
                      href="/tests"
                      role="menuitem"
                      className={moreLinkClass}
                      onClick={() => setMoreOpen(false)}
                    >
                      Kiểm tra
                    </Link>
                    <Link
                      href="/goals"
                      role="menuitem"
                      className={moreLinkClass}
                      onClick={() => setMoreOpen(false)}
                    >
                      Mục tiêu
                    </Link>
                    {isAdminUser(user) ? (
                      <>
                        <Link
                          href="/admin/lessons"
                          role="menuitem"
                          className={`${moreLinkClass} text-amber-800 dark:text-amber-300`}
                          onClick={() => setMoreOpen(false)}
                        >
                          Quản trị bài học
                        </Link>
                        <Link
                          href="/admin/topics"
                          role="menuitem"
                          className={`${moreLinkClass} text-amber-800 dark:text-amber-300`}
                          onClick={() => setMoreOpen(false)}
                        >
                          Quản trị chủ đề
                        </Link>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
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
