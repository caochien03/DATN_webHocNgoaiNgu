"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Brain,
  FileText,
  Home,
  Layers,
  LogOut,
  type LucideIcon,
  Map,
  Mic,
  RefreshCw,
  Route,
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { LearningLanguageSelector } from "@/components/LearningLanguageSelector";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { cn } from "@/lib/cn";
import { AppMark, AvatarCircle } from "./AppMark";
import { APP, BRAND } from "./brand";

const AUTH_PATHS = new Set(["/login", "/register"]);

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  activePrefixes?: string[];
  admin?: boolean;
  examPrep?: "ko" | "en";
};
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
      {
        href: "/topik/TOPIK_I",
        icon: Trophy,
        label: "TOPIK I & II",
        activePrefixes: ["/topik"],
        examPrep: "ko" as const,
      },
      {
        href: "/toeic/TOEIC_LR",
        icon: Trophy,
        label: "TOEIC LR",
        activePrefixes: ["/toeic"],
        examPrep: "en" as const,
      },
      { href: "/speaking", icon: Mic, label: "Luyện nói" },
      { href: "/tests", icon: Brain, label: "Kiểm tra" },
    ],
  },
  {
    group: "QUẢN TRỊ",
    items: [
      { href: "/admin/lessons", icon: FileText, label: "Bài ngữ pháp", admin: true },
      { href: "/admin/topics", icon: Layers, label: "Chủ đề từ vựng", admin: true },
      { href: "/admin/paths", icon: Map, label: "Lộ trình", admin: true },
      {
        href: "/admin/topik/exams",
        icon: Brain,
        label: "Đề TOPIK",
        activePrefixes: ["/admin/topik"],
        admin: true,
      },
      {
        href: "/admin/toeic/exams",
        icon: Brain,
        label: "Đề TOEIC",
        activePrefixes: ["/admin/toeic"],
        admin: true,
      },
      {
        href: "/admin/speaking/topics",
        icon: Mic,
        label: "Luyện nói",
        activePrefixes: ["/admin/speaking"],
        admin: true,
      },
    ],
  },
];

function matchesPath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isActive(pathname: string, href: string, activePrefixes: string[] = []) {
  return [href, ...activePrefixes].some((path) => matchesPath(pathname, path));
}

function Sidebar({
  user,
  showTopik,
  showToeic,
}: {
  user: AuthUser | null;
  showTopik: boolean;
  showToeic: boolean;
}) {
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
      className="flex w-[240px] flex-shrink-0 flex-col overflow-y-auto border-r border-border"
      style={{ backgroundColor: "var(--sidebar)", boxShadow: "var(--shadow-sidebar)" }}
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <AppMark className="h-10 w-10" />
        <div>
          <p className="text-sm font-extrabold leading-none tracking-tight text-foreground">{APP.name}</p>
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{APP.tagline}</p>
        </div>
      </Link>

      {/* User section */}
      {user ? (
        <div
          className="mx-3 my-3 flex items-center gap-3 rounded-xl px-3 py-3"
          style={{
            background: `linear-gradient(135deg, ${BRAND.blue}12, ${BRAND.cyan}08)`,
            border: `1px solid ${BRAND.blue}20`,
          }}
        >
          <AvatarCircle label={initial} className="h-9 w-9 flex-shrink-0 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {user.name || user.email}
            </p>
            <p className="text-[11px] font-medium" style={{ color: BRAND.blue }}>
              {admin ? "🛡️ Quản trị viên" : "🏃 Học viên"}
            </p>
          </div>
        </div>
      ) : null}

      {/* Nav */}
      <nav className="flex-1 space-y-5 px-3 py-3">
        {NAV.map((grp) => {
          const items = grp.items.filter((it) => {
            if (it.admin && !admin) return false;
            const active = isActive(pathname, it.href, it.activePrefixes);
            if (it.examPrep === "ko" && !showTopik && !active) return false;
            if (it.examPrep === "en" && !showToeic && !active) return false;
            return true;
          });
          if (items.length === 0) return null;
          return (
            <div key={grp.group}>
              <p className="mb-1.5 px-2 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                {grp.group}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(pathname, item.href, item.activePrefixes);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                        active
                          ? "text-white"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                            boxShadow: `0 4px 12px 0 ${BRAND.blue}40`,
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

      {/* Bottom actions */}
      <div className="space-y-0.5 border-t border-border px-3 pb-5 pt-3">
        <Link
          href="/me"
          className={cn(
            "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
            isActive(pathname, "/me")
              ? "text-white"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          {isActive(pathname, "/me") ? (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                boxShadow: `0 4px 12px 0 ${BRAND.blue}40`,
              }}
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
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-150 hover:bg-muted/60 hover:text-foreground"
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
  { match: (p) => p.startsWith("/toeic/attempts"), title: "Lịch sử TOEIC" },
  { match: (p) => p.startsWith("/toeic"), title: "Luyện thi TOEIC" },
  { match: (p) => p.startsWith("/topik/attempts"), title: "Lịch sử TOPIK" },
  { match: (p) => p.startsWith("/topik"), title: "Luyện thi TOPIK" },
  { match: (p) => p.startsWith("/tests"), title: "Kiểm tra" },
  { match: (p) => p.startsWith("/admin"), title: "Quản trị" },
  { match: (p) => p.startsWith("/me"), title: "Hồ sơ" },
];

function pageTitle(pathname: string) {
  return TITLES.find((t) => t.match(pathname))?.title ?? APP.name;
}

const PAGE_ICONS: Record<string, React.ReactNode> = {
  "Trang chủ": <Home size={17} />,
  "Mục tiêu ngày": <Target size={17} />,
  "Từ vựng": <BookOpen size={17} />,
  "Bộ thẻ": <Layers size={17} />,
  "Ôn tập SRS": <RefreshCw size={17} />,
  "Ngữ pháp": <FileText size={17} />,
  "Lộ trình": <Route size={17} />,
  "Luyện thi TOEIC": <Trophy size={17} />,
  "Lịch sử TOEIC": <Trophy size={17} />,
  "Luyện thi TOPIK": <Trophy size={17} />,
  "Lịch sử TOPIK": <Trophy size={17} />,
  "Luyện nói": <Mic size={17} />,
  "Kiểm tra": <Brain size={17} />,
  "Quản trị": <Settings size={17} />,
  "Hồ sơ": <Settings size={17} />,
};

function TopBar({
  title,
  showLearningLanguage,
}: {
  title: string;
  showLearningLanguage: boolean;
}) {
  const icon = PAGE_ICONS[title] ?? null;
  return (
    <div
      className="relative flex flex-shrink-0 items-center justify-between bg-background px-8 py-4"
      style={{ boxShadow: "var(--shadow-topbar)", borderBottom: "1px solid var(--border)" }}
    >
      {/* Bottom gradient accent */}
      <div
        className="absolute inset-x-0 bottom-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${BRAND.blue}60, ${BRAND.cyan}40, transparent)` }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={title}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          {icon ? (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}20, ${BRAND.cyan}15)`,
                color: BRAND.blue,
                border: `1px solid ${BRAND.blue}25`,
              }}
            >
              {icon}
            </span>
          ) : null}
          <h2 className="text-base font-bold text-foreground">{title}</h2>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-3">
        {showLearningLanguage ? (
          <LearningLanguageSelector className="hidden sm:block" />
        ) : null}
        <ThemeToggle />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const { languageCode } = useLearningLanguage();
  const showTopik = languageCode === "ko";
  const showToeic = languageCode === "en";

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
      <Sidebar user={user} showTopik={showTopik} showToeic={showToeic} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title={pageTitle(pathname)}
          showLearningLanguage={!pathname.startsWith("/admin")}
        />
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
