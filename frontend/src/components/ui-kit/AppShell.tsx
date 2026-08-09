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
  Users,
  Menu,
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
import { AppMark, AppWordmark } from "./AppMark";
import { AvatarWithFrame } from "./AvatarWithFrame";
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
      { href: "/groups", icon: Users, label: "Nhóm học tập" },
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
      { href: "/speaking", icon: Mic, label: "Luyện nói AI" },
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
  onCloseMobile,
}: {
  user: AuthUser | null;
  showTopik: boolean;
  showToeic: boolean;
  onCloseMobile?: () => void;
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
    <div className="flex h-full w-[250px] flex-col overflow-y-auto bg-card border-r border-border shadow-xs">
      {/* Logo */}
      <Link
        href="/"
        onClick={onCloseMobile}
        className="flex items-center gap-3 px-5 py-4 border-b border-border transition-colors hover:bg-secondary/40"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <AppMark size={36} className="h-9 w-9" />
        </motion.div>
        <div>
          <AppWordmark className="text-base font-black leading-none tracking-tight" />
          <p className="mt-1 text-[10px] font-bold text-primary">{APP.tagline}</p>
        </div>
      </Link>

      {/* User section */}
      {user ? (
        <Link
          href="/me"
          onClick={onCloseMobile}
          className="group mx-3 my-3 block rounded-2xl border border-primary/20 bg-primary/5 p-3 shadow-2xs transition-all hover:border-primary/40 hover:bg-primary/10 hover:shadow-xs"
        >
          <div className="flex items-center gap-3">
            <AvatarWithFrame
              avatarUrl={user.avatarUrl}
              frame={user.avatarFrame}
              fallbackInitial={initial}
              size={36}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-foreground group-hover:text-primary transition-colors">
                {user.name || user.email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-md"
                  style={{
                    backgroundColor: admin ? `${BRAND.purple}20` : `${BRAND.blue}20`,
                    color: admin ? BRAND.purple : BRAND.blue,
                  }}
                >
                  {admin ? "🛡️ Quản trị" : "🏃 Học viên"}
                </span>
                {user.avatarFrame && user.avatarFrame !== "DEFAULT" ? (
                  <span className="text-[10px]">
                    {user.avatarFrame === "FIRE_STREAK" ? "🔥" : user.avatarFrame === "DIAMOND_XP" ? "💎" : "👑"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Link>
      ) : null}

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-4 px-3 py-2">
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
              <p className="mb-1.5 px-2 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground/70">
                {grp.group}
              </p>
              <div className="space-y-1">
                {items.map((item) => {
                  const active = isActive(pathname, item.href, item.activePrefixes);
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150",
                          active
                            ? "text-white shadow-xs"
                            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                        )}
                      >
                        {active ? (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                              boxShadow: `0 4px 14px 0 ${BRAND.blue}40`,
                            }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                          />
                        ) : null}
                        <span className="relative z-10 flex items-center gap-2.5">
                          <Icon size={15} />
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="space-y-1 border-t border-border px-3 pb-4 pt-3">
        <motion.div
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Link
            href="/me"
            onClick={onCloseMobile}
            className={cn(
              "relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150",
              isActive(pathname, "/me")
                ? "text-white shadow-xs"
                : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
            )}
          >
            {isActive(pathname, "/me") ? (
              <motion.span
                layoutId="sidebar-active-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                  boxShadow: `0 4px 14px 0 ${BRAND.blue}40`,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-2.5">
              <Settings size={15} />
              Hồ sơ học tập
            </span>
          </Link>
        </motion.div>

        {user ? (
          <motion.button
            type="button"
            onClick={logout}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.96 }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut size={15} />
            Đăng xuất
          </motion.button>
        ) : (
          <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/login"
              onClick={onCloseMobile}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              <LogOut size={15} />
              Đăng nhập
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === "/", title: "Trang chủ" },
  { match: (p) => p.startsWith("/goals"), title: "Mục tiêu ngày" },
  { match: (p) => p.startsWith("/groups"), title: "Nhóm học tập" },
  { match: (p) => p.startsWith("/topics"), title: "Từ vựng" },
  { match: (p) => p.startsWith("/decks"), title: "Bộ thẻ" },
  { match: (p) => p.startsWith("/review"), title: "Ôn tập SRS" },
  { match: (p) => p.startsWith("/lessons"), title: "Ngữ pháp" },
  { match: (p) => p.startsWith("/paths"), title: "Lộ trình" },
  { match: (p) => p.startsWith("/toeic/attempts"), title: "Lịch sử TOEIC" },
  { match: (p) => p.startsWith("/toeic"), title: "Luyện thi TOEIC" },
  { match: (p) => p.startsWith("/topik/attempts"), title: "Lịch sử TOPIK" },
  { match: (p) => p.startsWith("/topik"), title: "Luyện thi TOPIK" },
  { match: (p) => p.startsWith("/speaking"), title: "Luyện nói AI" },
  { match: (p) => p.startsWith("/tests"), title: "Kiểm tra" },
  { match: (p) => p.startsWith("/admin"), title: "Quản trị hệ thống" },
  { match: (p) => p.startsWith("/me"), title: "Hồ sơ học viên" },
];

function pageTitle(pathname: string) {
  return TITLES.find((t) => t.match(pathname))?.title ?? APP.name;
}

const PAGE_ICONS: Record<string, React.ReactNode> = {
  "Trang chủ": <Home size={16} />,
  "Mục tiêu ngày": <Target size={16} />,
  "Nhóm học tập": <Users size={16} />,
  "Từ vựng": <BookOpen size={16} />,
  "Bộ thẻ": <Layers size={16} />,
  "Ôn tập SRS": <RefreshCw size={16} />,
  "Ngữ pháp": <FileText size={16} />,
  "Lộ trình": <Route size={16} />,
  "Luyện thi TOEIC": <Trophy size={16} />,
  "Lịch sử TOEIC": <Trophy size={16} />,
  "Luyện thi TOPIK": <Trophy size={16} />,
  "Lịch sử TOPIK": <Trophy size={16} />,
  "Luyện nói AI": <Mic size={16} />,
  "Kiểm tra": <Brain size={16} />,
  "Quản trị hệ thống": <Settings size={16} />,
  "Hồ sơ học viên": <Settings size={16} />,
};

function TopBar({
  title,
  showLearningLanguage,
  onOpenMobileMenu,
}: {
  title: string;
  showLearningLanguage: boolean;
  onOpenMobileMenu: () => void;
}) {
  const icon = PAGE_ICONS[title] ?? null;
  return (
    <div className="relative flex flex-shrink-0 items-center justify-between bg-card/90 backdrop-blur-md px-6 py-3.5 border-b border-border shadow-2xs z-20">
      {/* Bottom gradient line */}
      <div
        className="absolute inset-x-0 bottom-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, ${BRAND.blue}80, ${BRAND.cyan}50, transparent)`,
        }}
      />
      <div className="flex items-center gap-3">
        {/* Mobile menu hamburger */}
        <motion.button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-xl border border-border bg-secondary md:hidden text-foreground"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu size={18} />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={title}
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            {icon ? (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl shadow-2xs"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}20, ${BRAND.cyan}15)`,
                  color: BRAND.blue,
                  border: `1px solid ${BRAND.blue}30`,
                }}
              >
                {icon}
              </span>
            ) : null}
            <h2 className="text-sm font-black tracking-tight text-foreground">{title}</h2>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        {showLearningLanguage ? <LearningLanguageSelector /> : null}
        <ThemeToggle />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { languageCode } = useLearningLanguage();
  const showTopik = languageCode === "ko";
  const showToeic = languageCode === "en";

  useEffect(() => {
    setMounted(true);
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

  // Unauthenticated landing page takes full width without the app sidebar
  if (mounted && !user && pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar user={user} showTopik={showTopik} showToeic={showToeic} />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 md:hidden"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <Sidebar
                user={user}
                showTopik={showTopik}
                showToeic={showToeic}
                onCloseMobile={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title={pageTitle(pathname)}
          showLearningLanguage={!pathname.startsWith("/admin")}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
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
