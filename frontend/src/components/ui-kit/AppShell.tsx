"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  BookOpen,
  Brain,
  FileText,
  History,
  Home,
  Layers,
  LogOut,
  type LucideIcon,
  Map,
  RefreshCw,
  Route,
  Search,
  Settings,
  Target,
  Trophy,
} from "lucide-react";
import {
  clearStoredAuth,
  getStoredAuth,
  isAdminUser,
  type AuthUser,
} from "@/lib/auth-storage";
import { cn } from "@/lib/cn";
import { AppMark, AvatarCircle } from "./AppMark";
import { APP, BRAND } from "./brand";

const AUTH_PATHS = new Set(["/login", "/register"]);

type NavItem = { href: string; icon: LucideIcon; label: string; admin?: boolean };
type NavGroup = { group: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    group: "TỔNG QUAN",
    items: [
      { href: "/", icon: Home, label: "Trang chủ" },
      { href: "/goals", icon: Target, label: "Mục tiêu ngày" },
    ],
  },
  {
    group: "HỌC TẬP",
    items: [
      { href: "/topics", icon: BookOpen, label: "Từ vựng" },
      { href: "/decks", icon: Layers, label: "Bộ thẻ" },
      { href: "/review/today", icon: RefreshCw, label: "Ôn tập SRS" },
      { href: "/lessons", icon: FileText, label: "Ngữ pháp" },
      { href: "/paths", icon: Route, label: "Lộ trình" },
    ],
  },
  {
    group: "LUYỆN TẬP",
    items: [
      { href: "/topik/TOPIK_I", icon: Trophy, label: "TOPIK I & II" },
      { href: "/topik/attempts", icon: History, label: "Lịch sử TOPIK" },
      { href: "/tests", icon: Brain, label: "Kiểm tra" },
    ],
  },
  {
    group: "QUẢN TRỊ",
    items: [
      { href: "/admin/lessons", icon: FileText, label: "Bài ngữ pháp", admin: true },
      { href: "/admin/topics", icon: Layers, label: "Chủ đề từ vựng", admin: true },
      { href: "/admin/paths", icon: Map, label: "Lộ trình", admin: true },
      { href: "/admin/topik/exams", icon: Brain, label: "Đề TOPIK", admin: true },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar({ user }: { user: AuthUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = isAdminUser(user);
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  function logout() {
    clearStoredAuth();
    router.push("/login");
    router.refresh();
  }

  return (
    <motion.aside
      className="flex w-[232px] flex-shrink-0 flex-col overflow-y-auto border-r border-border"
      style={{ backgroundColor: "var(--sidebar)" }}
      initial={{ x: -232, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        href="/"
        className="flex items-center gap-3 border-b border-border px-5 py-6"
      >
        <AppMark className="h-9 w-9 rounded-xl text-lg" />
        <div>
          <p className="text-sm font-bold leading-none text-foreground">{APP.name}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{APP.tagline}</p>
        </div>
      </Link>

      {user ? (
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <AvatarCircle label={initial} className="h-8 w-8 flex-shrink-0 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name || user.email}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {admin ? "Quản trị viên" : "Học viên"}
            </p>
          </div>
        </div>
      ) : null}

      <nav className="flex-1 space-y-6 px-3 py-4">
        {NAV.map((grp) => {
          const items = grp.items.filter((it) => !it.admin || admin);
          if (items.length === 0) return null;
          return (
            <div key={grp.group}>
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {grp.group}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `linear-gradient(90deg,${BRAND.blue},#2952d9)`,
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      ) : null}
                      <span className="relative z-10 flex items-center gap-2.5">
                        <Icon size={15} />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-border px-3 pb-5 pt-3">
        <Link
          href="/me"
          className={cn(
            "relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            isActive(pathname, "/me")
              ? "text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {isActive(pathname, "/me") ? (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 rounded-xl"
              style={{ background: `linear-gradient(90deg,${BRAND.blue},#2952d9)` }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          ) : null}
          <span className="relative z-10 flex items-center gap-2.5">
            <Settings size={15} />
            Hồ sơ
          </span>
        </Link>
        {user ? (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut size={15} />
            Đăng nhập
          </Link>
        )}
      </div>
    </motion.aside>
  );
}

const TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === "/", title: "Trang chủ" },
  { match: (p) => p.startsWith("/goals"), title: "Mục tiêu ngày" },
  { match: (p) => p.startsWith("/topics"), title: "Từ vựng" },
  { match: (p) => p.startsWith("/decks"), title: "Bộ thẻ" },
  { match: (p) => p.startsWith("/review"), title: "Ôn tập SRS" },
  { match: (p) => p.startsWith("/lessons"), title: "Ngữ pháp" },
  { match: (p) => p.startsWith("/paths"), title: "Lộ trình" },
  { match: (p) => p.startsWith("/topik/attempts"), title: "Lịch sử TOPIK" },
  { match: (p) => p.startsWith("/topik"), title: "Luyện thi TOPIK" },
  { match: (p) => p.startsWith("/tests"), title: "Kiểm tra" },
  { match: (p) => p.startsWith("/admin"), title: "Quản trị" },
  { match: (p) => p.startsWith("/me"), title: "Hồ sơ" },
];

function pageTitle(pathname: string) {
  return TITLES.find((t) => t.match(pathname))?.title ?? APP.name;
}

function TopBar({ title }: { title: string }) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-background px-8 py-4">
      <AnimatePresence mode="wait">
        <motion.h2
          key={title}
          className="text-base font-semibold text-foreground"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.2 }}
        >
          {title}
        </motion.h2>
      </AnimatePresence>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className="w-48 rounded-xl border border-border bg-secondary py-1.5 pl-8 pr-4 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-primary/50 focus:outline-none"
            placeholder="Tìm kiếm..."
          />
        </div>
        <button
          type="button"
          className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell size={16} />
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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

  if (AUTH_PATHS.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={pageTitle(pathname)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mx-auto max-w-6xl"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
