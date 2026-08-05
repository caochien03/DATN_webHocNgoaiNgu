"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  BookOpen,
  Mic,
  Trophy,
  GraduationCap,
  Target,
  Flame,
  Play,
  ChevronRight,
  Check,
  Star,
  Zap,
  Brain,
  PenTool,
  Shuffle,
  Volume2,
  Globe,
  BarChart3,
  Users,
  Sparkles,
  Clock,
  TrendingUp,
  RefreshCw,
  Layers,
  Route,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { AppMark, AppWordmark } from "@/components/ui-kit/AppMark";
import { APP } from "@/components/ui-kit/brand";
import { ThemeToggle } from "@/components/ThemeToggle";

// ── Color Palette ──────────────────────────────────────────
const B = "#3B6EFF"; // blue primary
const C = "#0099D4"; // cyan
const P = "#7C3AED"; // purple
const G = "#059669"; // green
const Y = "#D97706"; // amber
const R = "#DC2626"; // red

interface ExamPart {
  name: string;
  q: number;
  color: string;
  pct: number;
  badge?: string;
}

// ── Animation Helpers ──────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
});

function InView({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  color = B,
  children,
}: {
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4"
      style={{
        backgroundColor: `${color}14`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"KR" | "EN">("KR");
  const [activeNav, setActiveNav] = useState<string>("#features");
  const [flipped, setFlipped] = useState(false);
  const [activeGame, setActiveGame] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [exam, setExam] = useState<"topik" | "toeic">("topik");
  const [activeLang, setActiveLang] = useState<"KR" | "EN">("KR");

  const links = [
    { label: "Tính năng", href: "#features" },
    { label: "Luyện nói AI", href: "#speaking" },
    { label: "TOPIK & TOEIC", href: "#exams" },
    { label: "Lộ trình", href: "#paths" },
    { label: "Bảng giá", href: "#pricing" },
  ];

  // Auto-detect active section on scroll (Scrollspy)
  useEffect(() => {
    const sectionIds = [
      { id: "features", href: "#features" },
      { id: "speaking", href: "#speaking" },
      { id: "exams", href: "#exams" },
      { id: "paths", href: "#paths" },
      { id: "pricing", href: "#pricing" },
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // When near bottom of page, highlight pricing / CTA
      if (scrollY + windowHeight >= documentHeight - 150) {
        setActiveNav("#pricing");
        return;
      }

      // Check sections from top to bottom
      const navbarOffset = 160;
      let matched = "#features";

      for (const s of sectionIds) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= navbarOffset && rect.bottom > navbarOffset) {
            matched = s.href;
            break;
          }
        }
      }

      setActiveNav(matched);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setActiveNav(href);
    setOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  const games = [
    { icon: <RefreshCw size={16} />, label: "Flashcard 3D", color: B, desc: "Lật thẻ • Space / ← →" },
    { icon: <Layers size={16} />, label: "Trắc nghiệm", color: C, desc: "4 lựa chọn MCQ" },
    { icon: <Shuffle size={16} />, label: "Ghép cặp", color: P, desc: "Nối từ theo tốc độ" },
    { icon: <PenTool size={16} />, label: "Luyện gõ", color: G, desc: "Gõ từ theo nghĩa" },
  ];

  const topics = [
    { ko: "인사", vi: "Chào hỏi", words: 24, pct: 100, color: B },
    { ko: "음식", vi: "Ẩm thực", words: 45, pct: 71, color: Y },
    { ko: "가족", vi: "Gia đình", words: 20, pct: 40, color: P },
    { ko: "날씨", vi: "Thời tiết", words: 28, pct: 0, color: C },
  ];

  const scenarios = [
    { ko: "식당", vi: "Gọi món nhà hàng", emoji: "🍜" },
    { ko: "쇼핑", vi: "Mua sắm thương lượng", emoji: "🛍️" },
    { ko: "면접", vi: "Phỏng vấn xin việc", emoji: "💼" },
    { ko: "길 찾기", vi: "Hỏi đường", emoji: "🗺️" },
  ];

  const topikParts: ExamPart[] = [
    { name: "Nghe (듣기)", q: 30, color: B, pct: 73 },
    { name: "Đọc (읽기)", q: 40, color: C, pct: 58 },
    { name: "Viết AI (쓰기)", q: 4, color: P, pct: 0, badge: "AI Gemini" },
  ];

  const toeicParts: ExamPart[] = [
    { name: "Part 1 — Photographs", q: 6, color: B, pct: 100 },
    { name: "Part 2 — Q&A", q: 25, color: C, pct: 80 },
    { name: "Part 3 — Conversations", q: 39, color: P, pct: 62 },
    { name: "Part 5 — Incomplete Sentences", q: 30, color: G, pct: 45 },
    { name: "Part 7 — Reading Passages", q: 54, color: Y, pct: 0 },
  ];

  const steps = [
    { type: "topic", ko: "인사", vi: "Chào hỏi", done: true },
    { type: "grammar", ko: "이다 / 아니다", vi: "Là / Không phải là", done: true },
    { type: "grammar", ko: "-아/어요", vi: "Đuôi kết thúc lịch sự", done: true },
    { type: "test", ko: "Kiểm tra A1", vi: "Quiz tổng hợp", done: false, active: true },
    { type: "topic", ko: "음식", vi: "Ẩm thực", done: false },
    { type: "grammar", ko: "-(으)면", vi: "Nếu... thì...", done: false },
  ];
  const colorMap: Record<string, string> = { topic: B, grammar: P, test: Y };

  const reviews = [
    {
      name: "Trần Anh Tú",
      role: "Đỗ TOPIK II Level 4",
      avatar: B,
      photo: "https://images.unsplash.com/photo-1689143944264-0516e270d2e9?w=120&h=120&fit=crop&auto=format",
      text: "SRS của hệ thống giúp mình nhớ từ lâu hơn hẳn. Từ con số 0 lên TOPIK II chỉ mất 8 tháng. NPC AI luyện nói rất tự nhiên!",
      score: "251/300",
      lang: "🇰🇷",
    },
    {
      name: "Lê Thị Mai",
      role: "TOEIC 890 — IT Manager",
      avatar: C,
      photo: "https://images.unsplash.com/photo-1759984782106-4b56d0aa05b8?w=120&h=120&fit=crop&auto=format",
      text: "Luyện TOEIC trên web cực tiện. Lời giải chi tiết từng câu giúp mình hiểu lý do vì sao sai thay vì chỉ biết đáp án đúng.",
      score: "890/990",
      lang: "🇬🇧",
    },
    {
      name: "Phạm Quốc Hùng",
      role: "Du học sinh Hàn Quốc",
      avatar: P,
      photo: "https://images.unsplash.com/photo-1695891768225-3605c2347636?w=120&h=120&fit=crop&auto=format",
      text: "Tính năng luyện nói với NPC đặc biệt hữu ích. Trước khi sang Hàn, mình luyện tình huống gọi món, hỏi đường mỗi ngày.",
      score: "TOPIK 5",
      lang: "🇰🇷",
    },
  ];

  const plans = [
    {
      name: "Miễn phí",
      price: "0₫",
      sub: "Mãi mãi",
      color: "#64728F",
      features: [
        "50 từ vựng mỗi ngày",
        "5 bài ngữ pháp A1",
        "Luyện nói 3 phiên/tháng",
        "TOPIK I — 1 đề mẫu",
      ],
      cta: "Bắt đầu miễn phí",
      href: "/register",
    },
    {
      name: "Pro",
      price: "99.000₫",
      sub: "/tháng",
      color: B,
      features: [
        "Không giới hạn từ vựng & SRS",
        "Toàn bộ 18 bài ngữ pháp",
        "Luyện nói AI không giới hạn",
        "Toàn bộ đề TOPIK I & II",
        "AI chấm bài Viết TOPIK II",
        "TOEIC 7 Part đầy đủ",
      ],
      cta: "Dùng thử 7 ngày miễn phí",
      href: "/register",
      highlight: true,
    },
    {
      name: "Nhóm",
      price: "Liên hệ",
      sub: "Từ 5 người",
      color: P,
      features: [
        "Tất cả tính năng Pro",
        "Dashboard quản lý lớp học",
        "Báo cáo tiến độ học viên",
        "Hỗ trợ ưu tiên 24/7",
        "Tùy chỉnh lộ trình học",
      ],
      cta: "Liên hệ tư vấn",
      href: "/register",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* ── 1. NAVBAR WITH INTERACTIVE CLICK ANIMATIONS ────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/80 shadow-xs"
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo with click spring bounce */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92, rotate: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <AppMark size={36} className="w-9 h-9 transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <AppWordmark className="text-base font-extrabold tracking-tight whitespace-nowrap leading-none" />
                <span className="text-[10px] font-bold text-primary whitespace-nowrap mt-1">
                  {APP.tagline}
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop links with sliding active pill & tap animations */}
          <div className="hidden lg:flex items-center gap-1.5 bg-secondary/50 p-1 rounded-2xl border border-border/60">
            {links.map((l) => {
              const isActive = activeNav === l.href;
              return (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  className={`relative px-4 py-1.5 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-primary dark:text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 bg-background rounded-xl shadow-xs border border-border/80"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-dot"
                        className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                  </span>
                </motion.a>
              );
            })}
          </div>

          {/* Right actions with micro-interactions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {/* Language toggle with spring sliding effect */}
            <div className="flex items-center gap-1 bg-secondary/80 rounded-xl p-1 border border-border">
              {(["KR", "EN"] as const).map((l) => (
                <motion.button
                  key={l}
                  onClick={() => setLang(l)}
                  className="px-3 py-1 rounded-lg text-xs font-bold relative transition-colors"
                  style={{
                    color: lang === l ? "#fff" : "var(--muted-foreground)",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {lang === l && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{ background: `linear-gradient(90deg,${B},${C})` }}
                      layoutId="navbar-lang-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    />
                  )}
                  <span className="relative z-10">{l}</span>
                </motion.button>
              ))}
            </div>

            {/* Login button with tap animation */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}>
              <Link
                href="/login"
                className="text-sm font-bold text-muted-foreground hover:text-foreground px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap block"
              >
                Đăng nhập
              </Link>
            </motion.div>

            {/* Register button with shine and tap pulse */}
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: `0 8px 24px ${B}50`,
              }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md inline-block whitespace-nowrap"
                style={{
                  background: `linear-gradient(90deg,${B},${C})`,
                  boxShadow: `0 4px 14px 0 ${B}40`,
                }}
              >
                Bắt đầu miễn phí
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button with tap animation */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <motion.button
              type="button"
              className="p-2 text-foreground rounded-xl border border-border bg-card shadow-xs"
              onClick={() => setOpen((o) => !o)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile dropdown drawer with smooth item tap animation */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="md:hidden bg-background/95 backdrop-blur-2xl border-t border-border px-6 py-4 space-y-2 shadow-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {links.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`block text-sm font-bold py-2 px-3 rounded-xl transition-colors ${
                    activeNav === l.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </motion.a>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <motion.div whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-bold border border-border bg-card text-foreground"
                  >
                    Đăng nhập
                  </Link>
                </motion.div>
                <motion.div whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
                    style={{ background: `linear-gradient(90deg,${B},${C})` }}
                  >
                    Bắt đầu miễn phí
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── 2. HERO SECTION ──────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[92vh] flex items-center bg-secondary/30">
        {/* Full-bleed background photo, right-anchored */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <img
            src="https://images.unsplash.com/photo-1759984782106-4b56d0aa05b8?w=1400&h=900&fit=crop&auto=format&q=85"
            alt="Học viên đang học tiếng Hàn"
            className="absolute right-0 top-0 h-full w-[65%] object-cover object-left"
          />
          {/* Fade gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, var(--background) 38%, transparent 80%, var(--background) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--background) 0%, transparent 15%, transparent 85%, var(--background) 100%)",
            }}
          />
        </motion.div>

        {/* Ambient subtle glow orb */}
        <motion.div
          className="absolute left-0 top-1/3 w-80 h-80 rounded-full pointer-events-none opacity-30"
          style={{ background: `radial-gradient(circle, ${B}40, transparent 70%)` }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />

        <div className="relative w-full max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT — Text content */}
            <div>
              <motion.div
                {...fadeUp(0.1)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6"
                style={{
                  backgroundColor: `${B}15`,
                  color: B,
                  border: `1px solid ${B}30`,
                }}
              >
                <Sparkles size={13} /> Học 2 ngôn ngữ — 1 nền tảng thông minh
              </motion.div>

              <motion.h1
                {...fadeUp(0.18)}
                className="text-4xl lg:text-5xl font-black text-foreground leading-tight mb-4 text-balance"
              >
                Thành thạo{" "}
                <span className="relative inline-block">
                  <span
                    style={{
                      background: `linear-gradient(90deg,${B},${C})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Tiếng Hàn &amp; Anh
                  </span>
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                    style={{ background: `linear-gradient(90deg,${B},${C})` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
                <br />
                với AI thông minh
              </motion.h1>

              <motion.p
                {...fadeUp(0.26)}
                className="text-muted-foreground text-base lg:text-lg leading-relaxed mb-8 max-w-lg text-balance"
              >
                Từ vựng SRS · Luyện nói với NPC AI · Luyện thi TOPIK &amp; TOEIC · Ngữ pháp có lộ trình. Học đúng lúc, đúng cách — theo dõi tiến độ thực sự.
              </motion.p>

              <motion.div {...fadeUp(0.34)} className="flex flex-wrap gap-3.5 mb-10">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg whitespace-nowrap"
                    style={{
                      background: `linear-gradient(90deg,${B},${C})`,
                      boxShadow: `0 8px 30px ${B}40`,
                    }}
                  >
                    <Play size={15} /> Bắt đầu miễn phí
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <a
                    href="#features"
                    onClick={(e) => handleNavClick(e, "#features")}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm border border-border bg-card/80 text-foreground transition-colors hover:bg-secondary whitespace-nowrap"
                  >
                    Xem tính năng <ChevronRight size={14} />
                  </a>
                </motion.div>
              </motion.div>

              {/* Social proof */}
              <motion.div {...fadeUp(0.42)} className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["#E8453C", "#3B6EFF", "#059669", "#D97706", "#7C3AED"].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: c, zIndex: 5 - i }}
                    >
                      {["N", "M", "A", "T", "L"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} fill={Y} style={{ color: Y }} />
                    ))}
                    <span className="text-sm font-black text-foreground ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-muted-foreground">12.400+ học viên đang sử dụng</p>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — Floating UI Cards */}
            <div className="relative hidden lg:block h-[520px]">
              {/* Main Flashcard */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 cursor-pointer"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.3,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 180,
                  damping: 20,
                }}
                onClick={() => setFlipped((f) => !f)}
                whileHover={{ y: -4 }}
              >
                <div
                  className="bg-card rounded-3xl p-7 text-center border border-border shadow-2xl"
                  style={{
                    boxShadow: `0 24px 64px rgba(59,110,255,0.18), 0 4px 16px rgba(0,0,0,0.08)`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,${B}20,${C}20)` }}
                  >
                    <BookOpen size={18} style={{ color: B }} />
                  </div>
                  <AnimatePresence mode="wait">
                    {!flipped ? (
                      <motion.div
                        key="f"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="text-foreground text-3xl font-black mb-1">감사합니다</p>
                        <p className="text-muted-foreground text-xs italic">gamsahamnida</p>
                        <p className="text-[11px] text-primary mt-3 font-semibold">
                          [Bấm để lật xem nghĩa →]
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="b"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="text-foreground text-lg font-bold mb-1">감사합니다</p>
                        <p className="text-2xl font-black text-primary">Cảm ơn</p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          &quot;도와줘서 감사합니다.&quot; — Cảm ơn đã giúp đỡ.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-1.5 mt-5 justify-center">
                    {["Quên", "Khó", "Tốt", "Dễ"].map((l, i) => (
                      <motion.button
                        key={l}
                        type="button"
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: [R, Y, C, G][i] }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.93 }}
                      >
                        {l}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Streak Card */}
              <motion.div
                className="absolute top-4 left-0 bg-card rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-amber-500/30 backdrop-blur-md"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 22 }}
                whileHover={{ y: -2 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Flame size={22} style={{ color: Y }} />
                </motion.div>
                <div>
                  <p className="text-foreground font-black text-sm">15 ngày liên tiếp</p>
                  <p className="text-muted-foreground text-xs">Chuỗi học xuất sắc!</p>
                </div>
              </motion.div>

              {/* Floating Score Card */}
              <motion.div
                className="absolute top-8 right-0 bg-card rounded-2xl shadow-xl px-4 py-3 border border-emerald-500/30 backdrop-blur-md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85, type: "spring", stiffness: 200, damping: 22 }}
                whileHover={{ y: -2 }}
              >
                <p className="text-xs text-muted-foreground mb-1">TOPIK I kết quả</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black" style={{ color: G }}>
                    214
                  </span>
                  <span className="text-xs text-muted-foreground mb-1">/300 điểm</span>
                </div>
                <div className="h-1.5 rounded-full mt-2 bg-emerald-500/20 w-24">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: G }}
                    initial={{ width: 0 }}
                    animate={{ width: "71%" }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  />
                </div>
              </motion.div>

              {/* Floating NPC Chat */}
              <motion.div
                className="absolute bottom-16 right-2 bg-card rounded-2xl shadow-xl p-3.5 border border-purple-500/30 w-56 backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, type: "spring", stiffness: 200, damping: 22 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                    style={{ background: `linear-gradient(135deg,${P},${B})` }}
                  >
                    AI
                  </div>
                  <span className="text-xs font-bold text-foreground">NPC Hana</span>
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full ml-auto"
                    style={{ backgroundColor: G }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </div>
                <p className="text-xs text-foreground font-semibold">
                  무엇을 주문하시겠어요?
                </p>
                <p className="text-[10px] text-muted-foreground">Bạn muốn gọi món gì ạ?</p>
              </motion.div>

              {/* Floating Progress */}
              <motion.div
                className="absolute bottom-12 left-0 bg-card rounded-2xl shadow-xl px-4 py-3.5 border border-primary/30 w-44 backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 22 }}
                whileHover={{ y: -2 }}
              >
                <p className="text-xs text-muted-foreground mb-2 font-bold">Tiến độ hôm nay</p>
                {[
                  { l: "Từ vựng", p: 70, c: B },
                  { l: "Ngữ pháp", p: 40, c: P },
                ].map((r) => (
                  <div key={r.l} className="mb-2 last:mb-0">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">{r.l}</span>
                      <span className="font-mono font-bold" style={{ color: r.c }}>
                        {r.p}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: r.c }}
                        initial={{ width: 0 }}
                        animate={{ width: `${r.p}%` }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. STATS BAR ─────────────────────────────────────── */}
      <section className="py-12 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: <Users size={20} />, value: "12.400+", label: "Học viên tích cực", color: B },
              { icon: <BookOpen size={20} />, value: "50.000+", label: "Từ vựng trong kho", color: C },
              { icon: <Trophy size={20} />, value: "89%", label: "Tỷ lệ đỗ TOPIK/TOEIC", color: G },
              { icon: <Flame size={20} />, value: "21 ngày", label: "Chuỗi Streak trung bình", color: Y },
              { icon: <Globe size={20} />, value: "2 ngôn ngữ", label: "Tiếng Hàn & Tiếng Anh", color: P },
            ].map((s, i) => (
              <InView key={s.label} delay={i * 0.07}>
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}15`, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <p className="text-foreground text-2xl font-black">{s.value}</p>
                  <p className="text-muted-foreground text-xs font-semibold">{s.label}</p>
                </div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. SEOUL STRIP BANNER ────────────────────────────── */}
      <section className="relative h-56 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1546874177-9e664107314e?w=1400&h=400&fit=crop&auto=format"
          alt="Thành phố Seoul về đêm"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(24,37,62,0.92) 0%, rgba(24,37,62,0.65) 50%, rgba(59,110,255,0.3) 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-white/80 text-sm font-semibold mb-1 tracking-wide">
                서울에서 배우는 것처럼
              </p>
              <h3 className="text-white text-2xl lg:text-3xl font-black">
                Học Tiếng Hàn &amp; Tiếng Anh như người bản xứ thực thụ
              </h3>
              <p className="text-white/70 text-sm mt-2">
                Từ vựng SRS · Giao tiếp AI · Luyện thi TOPIK/TOEIC · Lộ trình bài bản
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. MODULE 1: VOCABULARY & SRS ────────────────────── */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <InView>
            <SectionLabel color={B}>
              <BookOpen size={12} /> Module 1 — Từ vựng &amp; SRS
            </SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
              Kho từ vựng phong phú +<br />
              <span style={{ color: B }}>thuật toán ôn tập thông minh</span>
            </h2>
            <p className="text-muted-foreground text-base lg:text-lg max-w-2xl mb-12">
              Spaced Repetition System (SRS) tự động tính chu kỳ quên và xếp lịch ôn đúng lúc bạn sắp quên. 4 mini-game giữ bạn hứng thú mỗi ngày.
            </p>
          </InView>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: Topics Preview */}
            <InView delay={0.1}>
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-foreground text-base">Chủ đề từ vựng — TOPIK 1</h3>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: `${B}15`, color: B }}
                  >
                    12 chủ đề
                  </span>
                </div>
                <div className="space-y-3">
                  {topics.map((t, i) => (
                    <motion.div
                      key={t.ko}
                      className="flex items-center gap-4 p-3 rounded-2xl border border-border bg-secondary/20 cursor-pointer transition-colors"
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      viewport={{ once: true }}
                      whileHover={{ borderColor: `${t.color}60` }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                        style={{ backgroundColor: `${t.color}15`, color: t.color }}
                      >
                        {t.ko[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground text-sm">{t.ko}</span>
                          <span className="text-muted-foreground text-xs">— {t.vi}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-secondary">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: t.color }}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${t.pct}%` }}
                              transition={{ delay: i * 0.1 + 0.3, duration: 0.7 }}
                              viewport={{ once: true }}
                            />
                          </div>
                          <span
                            className="text-xs font-mono font-bold shrink-0"
                            style={{ color: t.color }}
                          >
                            {t.pct}%
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {t.pct === 100 ? (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${G}20` }}
                          >
                            <Check size={12} style={{ color: G }} />
                          </div>
                        ) : (
                          <Link
                            href="/register"
                            className="text-xs font-bold px-3 py-1 rounded-lg text-white inline-flex items-center gap-1"
                            style={{ background: `linear-gradient(90deg,${t.color},${t.color}dd)` }}
                          >
                            <Play size={10} /> Học
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* SRS Queue Status */}
                <div
                  className="mt-5 p-3.5 rounded-2xl border"
                  style={{ backgroundColor: `${B}08`, borderColor: `${B}20` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw size={14} style={{ color: B }} />
                    <span className="text-xs font-bold" style={{ color: B }}>
                      SRS — Hôm nay cần ôn
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { l: "Mới", v: 8, c: B },
                      { l: "Ôn tập", v: 23, c: Y },
                      { l: "Từ yếu", v: 5, c: R },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="flex-1 text-center py-2 rounded-xl"
                        style={{ backgroundColor: `${s.c}15` }}
                      >
                        <p className="text-lg font-black" style={{ color: s.c }}>
                          {s.v}
                        </p>
                        <p className="text-[10px] font-bold" style={{ color: s.c }}>
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </InView>

            {/* Right: 4 Mini-games Showcase */}
            <InView delay={0.2}>
              <div className="space-y-4">
                {/* Visual Banner */}
                <motion.div
                  className="rounded-2xl overflow-hidden h-36 relative border border-border"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1592976595777-b9e870eabdce?w=700&h=300&fit=crop&auto=format"
                    alt="Sách học tiếng Hàn"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-end p-4"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(24,37,62,0.85) 0%, transparent 65%)",
                    }}
                  >
                    <div>
                      <p className="text-white font-bold text-sm">50.000+ từ vựng phong phú</p>
                      <p className="text-white/80 text-xs">Kèm audio phát âm chuẩn &amp; ví dụ ngữ cảnh</p>
                    </div>
                  </div>
                </motion.div>

                <h3 className="font-black text-foreground text-lg">4 Mini-game phản xạ</h3>

                {games.map((g, i) => (
                  <motion.div
                    key={g.label}
                    className="bg-card rounded-2xl p-4 border border-border cursor-pointer flex items-center gap-4 transition-all"
                    style={{
                      borderColor: activeGame === i ? `${g.color}60` : undefined,
                    }}
                    onClick={() => setActiveGame(i)}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 3 }}
                  >
                    <motion.div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${g.color}15`, color: g.color }}
                      animate={activeGame === i ? { scale: [1, 1.1, 1] } : {}}
                      transition={{
                        repeat: activeGame === i ? Infinity : 0,
                        duration: 1.8,
                      }}
                    >
                      {g.icon}
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{g.label}</p>
                      <p className="text-muted-foreground text-xs">{g.desc}</p>
                    </div>
                    {activeGame === i && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: g.color }}
                      >
                        <Check size={10} className="text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {/* Audio visualizer */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${Y}15`, color: Y }}
                    >
                      <Volume2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Audio phát âm chuẩn</p>
                      <p className="text-muted-foreground text-xs">Giọng bản ngữ · Cả câu ví dụ</p>
                    </div>
                    <motion.button
                      type="button"
                      className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
                      style={{ background: `linear-gradient(135deg,${Y},${R})` }}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.93 }}
                    >
                      <Play size={12} />
                    </motion.button>
                  </div>
                  <div className="mt-3 flex gap-1 items-end h-8">
                    {[3, 5, 8, 6, 10, 7, 4, 9, 5, 8, 6, 3, 7, 9, 5].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{ backgroundColor: B }}
                        initial={{ height: 4 }}
                        animate={{ height: h * 3 }}
                        transition={{
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 0.4,
                          delay: i * 0.06,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* ── 6. MODULE 2: SPEAKING AI ─────────────────────────── */}
      <section id="speaking" className="py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: Interactive Chat Simulation */}
            <InView delay={0.1}>
              <div className="relative">
                {/* Photo backdrop */}
                <div className="rounded-3xl overflow-hidden mb-4 h-40 relative border border-border">
                  <img
                    src="https://images.unsplash.com/photo-1759984782199-a4f6d1b6054e?w=700&h=300&fit=crop&auto=format"
                    alt="Luyện nói AI"
                    className="w-full h-full object-cover object-top"
                  />
                  <div
                    className="absolute inset-0 flex items-end p-4"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(124,58,237,0.85) 0%, transparent 55%)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg,${P},${B})` }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        AI
                      </motion.div>
                      <div>
                        <p className="text-white font-bold text-sm">NPC Hana đang chờ bạn</p>
                        <p className="text-white/80 text-xs">Nói tiếng Hàn · Phản hồi theo ngữ cảnh</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/40 rounded-3xl p-5 border border-border">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
                      style={{ background: `linear-gradient(135deg,${P},${B})` }}
                    >
                      하
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">NPC Hana — 식당 직원</p>
                      <div className="flex items-center gap-1.5">
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: G }}
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                        <span className="text-xs text-muted-foreground">Đang hoạt động</span>
                      </div>
                    </div>
                    <div
                      className="ml-auto text-xs px-2.5 py-1 rounded-lg font-bold"
                      style={{ backgroundColor: `${G}15`, color: G }}
                    >
                      Gemini AI
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 mb-4">
                    {[
                      { from: "npc", text: "어서 오세요! 몇 분이세요?", sub: "Chào mừng! Quý khách mấy người ạ?" },
                      { from: "user", text: "두 명이요. 창가 자리 있어요?", sub: "Hai người. Còn bàn gần cửa sổ không ạ?" },
                      { from: "npc", text: "네, 물론이죠! 이쪽으로 오세요.", sub: "Vâng, còn ạ! Mời quý khách theo đây." },
                      { from: "user", text: "감사합니다! 메뉴 좀 주세요.", sub: "Cảm ơn! Cho tôi xem menu nhé." },
                    ].map((m, i) => (
                      <motion.div
                        key={i}
                        className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div
                          className="max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-sm"
                          style={
                            m.from === "user"
                              ? { background: `linear-gradient(135deg,${B},${C})` }
                              : {
                                  backgroundColor: "var(--card)",
                                  border: "1px solid var(--border)",
                                }
                          }
                        >
                          <p
                            className={`text-sm font-bold ${
                              m.from === "user" ? "text-white" : "text-foreground"
                            }`}
                          >
                            {m.text}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              m.from === "user" ? "text-white/80" : "text-muted-foreground"
                            }`}
                          >
                            {m.sub}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Goals progress */}
                  <div className="bg-card rounded-2xl p-3.5 border border-border mb-3">
                    <p className="text-xs font-bold text-foreground mb-2">Mục tiêu hội thoại</p>
                    {[
                      { text: "Chào hỏi nhân viên", done: true },
                      { text: "Hỏi số người & bàn", done: true },
                      { text: "Yêu cầu menu", done: true },
                      { text: "Gọi món ăn", done: false },
                    ].map((g) => (
                      <div key={g.text} className="flex items-center gap-2 py-0.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            g.done ? "" : "border border-border"
                          }`}
                          style={g.done ? { backgroundColor: `${G}25` } : {}}
                        >
                          {g.done && <Check size={10} style={{ color: G }} />}
                        </div>
                        <span
                          className={`text-xs ${
                            g.done ? "line-through text-muted-foreground" : "text-foreground font-medium"
                          }`}
                        >
                          {g.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Mic button */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white shadow-md"
                      style={
                        speaking
                          ? { background: `linear-gradient(135deg,${R},#F87171)` }
                          : { background: `linear-gradient(90deg,${B},${C})` }
                      }
                      onClick={() => setSpeaking((s) => !s)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div
                        animate={speaking ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      >
                        <Mic size={16} />
                      </motion.div>
                      {speaking ? "Đang ghi âm..." : "Nhấn để nói (Microphone)"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </InView>

            {/* Right: Description & Scenarios */}
            <div>
              <InView>
                <SectionLabel color={P}>
                  <Mic size={12} /> Module 2 — Luyện nói AI
                </SectionLabel>
                <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
                  Đàm thoại với NPC AI<br />
                  <span style={{ color: P }}>trong tình huống thực tế</span>
                </h2>
                <p className="text-muted-foreground text-base lg:text-lg mb-8">
                  Nói vào micro, AI phân tích giọng nói và NPC phản hồi tự nhiên như người bản ngữ. Không cần partner học — luyện 24/7.
                </p>
              </InView>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {scenarios.map((s, i) => (
                  <InView key={s.ko} delay={i * 0.08}>
                    <motion.div
                      className="bg-secondary/40 rounded-2xl p-4 border border-border cursor-pointer transition-all"
                      whileHover={{ borderColor: `${P}50`, y: -2 }}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <p className="font-bold text-foreground text-sm mt-2">{s.ko}</p>
                      <p className="text-muted-foreground text-xs">{s.vi}</p>
                    </motion.div>
                  </InView>
                ))}
              </div>

              <InView delay={0.1}>
                <div className="space-y-3">
                  {[
                    {
                      icon: <BarChart3 size={16} />,
                      title: "Báo cáo nhận xét sau phiên nói",
                      desc: "AI tổng hợp, chấm điểm và đưa ra nhận xét chi tiết sau khi kết thúc",
                      color: P,
                    },
                    {
                      icon: <Target size={16} />,
                      title: "Theo dõi mục tiêu hội thoại",
                      desc: "Tự động đánh dấu tick các mục tiêu hoàn thành trong cuộc trò chuyện",
                      color: B,
                    },
                    {
                      icon: <Zap size={16} />,
                      title: "Đối thoại thời gian thực",
                      desc: "NPC phản hồi liền mạch, tạo phản xạ giao tiếp tự nhiên",
                      color: Y,
                    },
                  ].map((f, i) => (
                    <motion.div
                      key={f.title}
                      className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card/60"
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      viewport={{ once: true }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${f.color}15`, color: f.color }}
                      >
                        {f.icon}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{f.title}</p>
                        <p className="text-muted-foreground text-xs">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </InView>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. MODULE 3: TOPIK & TOEIC ───────────────────────── */}
      <section id="exams" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <InView className="text-center mb-12">
            <SectionLabel color={G}>
              <Trophy size={12} /> Module 3 — Luyện thi chứng chỉ
            </SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
              TOPIK I &amp; II · TOEIC L&amp;R<br />
              <span style={{ color: G }}>đề chuẩn format · chấm điểm tự động</span>
            </h2>
            <p className="text-muted-foreground text-base lg:text-lg max-w-xl mx-auto">
              Ngân hàng đề đầy đủ, đồng hồ bấm giờ, chấm điểm tự động và AI chấm bài viết TOPIK II.
            </p>
          </InView>

          {/* Exam Toggle Switcher */}
          <div className="flex justify-center mb-10">
            <div className="flex gap-1 p-1 rounded-2xl border border-border bg-card shadow-sm">
              {[
                { id: "topik" as const, label: "🇰🇷 TOPIK I & II" },
                { id: "toeic" as const, label: "🇬🇧 TOEIC L&R" },
              ].map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setExam(t.id)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold relative"
                  style={{ color: exam === t.id ? "#fff" : "var(--muted-foreground)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  {exam === t.id && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: `linear-gradient(90deg,${B},${C})` }}
                      layoutId="exam-tab"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={exam}
              className="grid lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Left: Structure breakdown */}
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                <div className="rounded-2xl overflow-hidden h-36 mb-5 relative border border-border">
                  <img
                    src="https://images.unsplash.com/photo-1550592704-6c76defa9985?w=700&h=220&fit=crop&auto=format"
                    alt="Luyện thi chứng chỉ"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-end p-3"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(5,150,105,0.85) 0%, transparent 55%)",
                    }}
                  >
                    <p className="text-white text-xs font-bold">
                      Đề thi chuẩn format · Chấm điểm tự động
                    </p>
                  </div>
                </div>
                <h3 className="font-black text-foreground mb-5 text-base">
                  {exam === "topik" ? "Cấu trúc đề thi TOPIK" : "7 Part TOEIC chuẩn ETS"}
                </h3>
                <div className="space-y-3">
                  {(exam === "topik" ? topikParts : toeicParts).map((p, i) => (
                    <motion.div
                      key={p.name}
                      className="p-3.5 rounded-2xl border border-border bg-secondary/20"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ borderColor: `${p.color}50` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-sm font-bold">{p.name}</span>
                          {p.badge && (
                            <span
                              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${P}15`, color: P }}
                            >
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-semibold">
                          {p.q} câu
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: p.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${p.pct}%` }}
                            transition={{ delay: i * 0.08 + 0.2, duration: 0.7 }}
                          />
                        </div>
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: p.color }}
                        >
                          {p.pct}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: Simulation features */}
              <div className="space-y-4">
                {/* Timer mock */}
                <div className="bg-card rounded-3xl p-5 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-foreground">
                      {exam === "topik" ? "TOPIK I — Đề thi thử số 01" : "TOEIC Full Test 2026"}
                    </span>
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                      style={{ backgroundColor: `${B}10`, borderColor: `${B}25` }}
                    >
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      >
                        <Clock size={14} style={{ color: B }} />
                      </motion.div>
                      <span className="font-mono font-black text-sm" style={{ color: B }}>
                        {exam === "topik" ? "01:23:45" : "01:52:30"}
                      </span>
                    </div>
                  </div>

                  {/* Question Map */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {Array.from({ length: exam === "topik" ? 30 : 20 }, (_, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shadow-xs"
                        style={
                          i < 12
                            ? { background: `linear-gradient(135deg,${B},${C})`, color: "#fff" }
                            : i === 12
                              ? { border: `2px solid ${B}`, color: B }
                              : {
                                  backgroundColor: "var(--secondary)",
                                  color: "var(--muted-foreground)",
                                }
                        }
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/register"
                    className="w-full py-2.5 rounded-xl text-white text-sm font-bold text-center block shadow-md"
                    style={{ background: `linear-gradient(90deg,${B},${C})` }}
                  >
                    <Play size={14} className="inline mr-2" />
                    {exam === "topik" ? "Bắt đầu thi thử TOPIK" : "Bắt đầu thi thử TOEIC"}
                  </Link>
                </div>

                {/* AI Writing Scoring (TOPIK only) */}
                {exam === "topik" && (
                  <motion.div
                    className="bg-card rounded-3xl p-5 shadow-sm border border-purple-500/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${P}15`, color: P }}
                      >
                        <Sparkles size={14} />
                      </div>
                      <span className="font-bold text-foreground text-sm">
                        AI chấm bài Viết (Câu 51–54)
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {[
                        "Chấm điểm ngữ pháp & từ vựng theo barem",
                        "Chỉ ra lỗi sai chính tả và cấu trúc câu",
                        "Gợi ý câu văn học thuật và tự nhiên hơn",
                        "Điểm tổng & nhận xét chi tiết từng đoạn",
                      ].map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <Check size={12} style={{ color: G }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TOEIC Score Result Breakdown */}
                {exam === "toeic" && (
                  <motion.div
                    className="bg-card rounded-3xl p-5 shadow-sm border border-emerald-500/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="font-bold text-foreground text-sm mb-3">
                      Lời giải chi tiết từng câu
                    </p>
                    <div className="flex gap-3">
                      {[
                        { l: "Listening", v: 420, max: 495, c: B },
                        { l: "Reading", v: 385, max: 495, c: C },
                      ].map((s) => (
                        <div
                          key={s.l}
                          className="flex-1 p-3 rounded-2xl text-center border border-border"
                          style={{ backgroundColor: `${s.c}10` }}
                        >
                          <p className="text-xl font-black" style={{ color: s.c }}>
                            {s.v}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            {s.l} / {s.max}
                          </p>
                          <div className="h-1 rounded-full mt-1.5 bg-secondary">
                            <div
                              className="h-full rounded-full"
                              style={{
                                backgroundColor: s.c,
                                width: `${(s.v / s.max) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <div
                        className="flex-1 p-3 rounded-2xl text-center border border-border"
                        style={{ backgroundColor: `${G}10` }}
                      >
                        <p className="text-xl font-black" style={{ color: G }}>
                          805
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          Tổng / 990
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── 8. MODULE 4: GRAMMAR & PATHS ─────────────────────── */}
      <section id="paths" className="py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left Description */}
            <div>
              <InView>
                <SectionLabel color={P}>
                  <GraduationCap size={12} /> Module 4 — Ngữ pháp &amp; Lộ trình
                </SectionLabel>
                <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
                  Học có hệ thống —<br />
                  <span style={{ color: P }}>từng bước vững chắc</span>
                </h2>
                <p className="text-muted-foreground text-base lg:text-lg mb-8">
                  Các bài ngữ pháp theo 6 cấp độ A1→C2, lộ trình step-by-step, kiểm tra tự động từ kho từ vựng và bài học đã hoàn thành.
                </p>
              </InView>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: <GraduationCap size={18} />,
                    title: "Bài học ngữ pháp",
                    sub: "Phân cấp · A1 → C2 · Ví dụ & bài tập điền từ",
                    color: P,
                  },
                  {
                    icon: <Route size={18} />,
                    title: "Lộ trình bài bản",
                    sub: "Step-by-step · Lưu tiến độ hoàn thành",
                    color: B,
                  },
                  {
                    icon: <Brain size={18} />,
                    title: "Kiểm tra tự động",
                    sub: "Đề ngẫu nhiên từ bài học đã học",
                    color: G,
                  },
                  {
                    icon: <TrendingUp size={18} />,
                    title: "Theo dõi tiến độ",
                    sub: "Biểu đồ kỹ năng chi tiết trên trang cá nhân",
                    color: Y,
                  },
                ].map((f, i) => (
                  <InView key={f.title} delay={i * 0.07}>
                    <motion.div
                      className="p-4 rounded-2xl border border-border bg-secondary/30"
                      whileHover={{ borderColor: `${f.color}50`, y: -2 }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${f.color}15`, color: f.color }}
                      >
                        {f.icon}
                      </div>
                      <p className="font-bold text-foreground text-sm">{f.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{f.sub}</p>
                    </motion.div>
                  </InView>
                ))}
              </div>
            </div>

            {/* Right: Path Step List */}
            <InView delay={0.15}>
              <div className="bg-secondary/30 rounded-3xl p-6 border border-border">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="font-black text-foreground">TOPIK I — Sơ cấp 1</p>
                    <p className="text-muted-foreground text-xs mt-0.5">3/6 bước hoàn thành</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black" style={{ color: B }}>
                      50%
                    </p>
                    <p className="text-muted-foreground text-xs">tiến độ</p>
                  </div>
                </div>
                <div className="h-2 rounded-full mb-6 bg-secondary">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg,${B},${C})` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: "50%" }}
                    transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                    viewport={{ once: true }}
                  />
                </div>
                <div className="space-y-2.5">
                  {steps.map((s, i) => {
                    const c = colorMap[s.type] || B;
                    return (
                      <motion.div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          s.done
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : s.active
                              ? "border-primary/40 bg-primary/10"
                              : "border-border bg-card"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={
                            s.done
                              ? { backgroundColor: `${G}20` }
                              : s.active
                                ? { backgroundColor: `${B}20` }
                                : { backgroundColor: "var(--secondary)" }
                          }
                          animate={
                            s.active
                              ? {
                                  boxShadow: [
                                    `0 0 0px ${B}00`,
                                    `0 0 12px ${B}60`,
                                    `0 0 0px ${B}00`,
                                  ],
                                }
                              : {}
                          }
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          {s.done ? (
                            <Check size={13} style={{ color: G }} />
                          ) : (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: s.active ? B : "var(--muted-foreground)" }}
                            />
                          )}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${c}15`, color: c }}
                            >
                              {s.type === "topic"
                                ? "Từ vựng"
                                : s.type === "grammar"
                                  ? "Ngữ pháp"
                                  : "Kiểm tra"}
                            </span>
                          </div>
                          <p
                            className={`text-sm font-bold mt-0.5 ${
                              s.done ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {s.ko}
                          </p>
                        </div>
                        {s.active && (
                          <Link
                            href="/register"
                            className="px-3 py-1.5 rounded-lg text-xs text-white font-bold"
                            style={{ background: `linear-gradient(90deg,${B},${C})` }}
                          >
                            Học ngay
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* ── 9. MODULE 5: BILINGUAL + GOALS ───────────────────── */}
      <section className="py-24 bg-secondary/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <InView className="text-center mb-12">
            <SectionLabel color={G}>
              <Globe size={12} /> Module 5 — Song ngữ &amp; Mục tiêu
            </SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
              Học 2 ngôn ngữ song song —<br />
              <span style={{ color: G }}>dữ liệu tách biệt hoàn toàn</span>
            </h2>
            <p className="text-muted-foreground text-base lg:text-lg max-w-xl mx-auto">
              Chuyển ngôn ngữ học chỉ với 1 click. Chuỗi Streak, mục tiêu ngày và lịch sử 30 ngày được lưu riêng cho Tiếng Hàn và Tiếng Anh.
            </p>
          </InView>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Language Switcher Card */}
            <InView delay={0.05}>
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                <p className="text-sm font-bold text-foreground mb-4">
                  Chuyển đổi ngôn ngữ học
                </p>
                <div className="flex gap-2 mb-5">
                  {[
                    { id: "KR" as const, flag: "🇰🇷", label: "Tiếng Hàn" },
                    { id: "EN" as const, flag: "🇬🇧", label: "Tiếng Anh" },
                  ].map((l) => (
                    <motion.button
                      key={l.id}
                      onClick={() => setActiveLang(l.id)}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold flex flex-col items-center gap-1 relative border border-border"
                      style={{ color: activeLang === l.id ? "#fff" : "var(--muted-foreground)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {activeLang === l.id && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{ background: `linear-gradient(135deg,${B},${C})` }}
                          layoutId="lang-sw"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative text-xl">{l.flag}</span>
                      <span className="relative text-xs">{l.label}</span>
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLang}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-2">
                      {[
                        { l: "Chuỗi ngày Streak", v: activeLang === "KR" ? "15 🔥" : "7 🔥" },
                        { l: "Từ vựng đã học", v: activeLang === "KR" ? "334" : "512" },
                        { l: "Mục tiêu hôm nay", v: activeLang === "KR" ? "14/30 thẻ" : "0/20 thẻ" },
                      ].map((s) => (
                        <div
                          key={s.l}
                          className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
                        >
                          <span className="text-muted-foreground text-xs">{s.l}</span>
                          <span className="text-foreground font-black text-sm">{s.v}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </InView>

            {/* 30-day Calendar Heatmap */}
            <InView delay={0.12}>
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-foreground">Lịch học 30 ngày</p>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: `${G}15`, color: G }}
                  >
                    Tháng 8/2026
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
                    <div
                      key={d}
                      className="text-center text-[10px] text-muted-foreground font-bold pb-1"
                    >
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => {
                    const done = i < 15 && i !== 4 && i !== 9;
                    const today = i === 14;
                    return (
                      <motion.div
                        key={i}
                        className="aspect-square rounded-xl flex items-center justify-center text-[11px] font-black shadow-xs"
                        style={
                          today
                            ? { background: `linear-gradient(135deg,${B},${C})`, color: "#fff" }
                            : done
                              ? { backgroundColor: `${G}20`, color: G }
                              : i === 4 || i === 9
                                ? { backgroundColor: `${R}15`, color: R }
                                : {
                                    backgroundColor: "var(--secondary)",
                                    color: "var(--muted-foreground)",
                                  }
                        }
                        initial={{ scale: 0.7, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.015 }}
                        viewport={{ once: true }}
                      >
                        {i + 1}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </InView>

            {/* Profile Skill Breakdown */}
            <InView delay={0.18}>
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-black"
                    style={{ background: `linear-gradient(135deg,${B},${C})` }}
                  >
                    N
                  </div>
                  <div>
                    <p className="font-black text-foreground">Nguyễn Minh</p>
                    <p className="text-muted-foreground text-xs">TOPIK 2 · TOEIC 805</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-muted-foreground mb-3">
                  Biểu đồ kỹ năng tổng thể
                </p>
                <div className="space-y-3">
                  {[
                    { l: "Từ vựng", v: 82, c: B },
                    { l: "Ngữ pháp", v: 65, c: P },
                    { l: "Luyện nói", v: 48, c: G },
                    { l: "TOPIK", v: 71, c: Y },
                    { l: "TOEIC", v: 81, c: C },
                  ].map((s, i) => (
                    <div key={s.l}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-semibold">{s.l}</span>
                        <span className="font-mono font-bold" style={{ color: s.c }}>
                          {s.v}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: s.c }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.v}%` }}
                          transition={{ delay: i * 0.08 + 0.2, duration: 0.7 }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* ── 10. TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <InView className="text-center mb-12">
            <SectionLabel color={Y}>
              <Star size={12} /> Học viên nói gì
            </SectionLabel>
            <h2 className="text-3xl font-black text-foreground">12.400+ học viên tin tưởng</h2>
          </InView>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <InView key={r.name} delay={i * 0.1}>
                <motion.div
                  className="bg-secondary/30 rounded-3xl p-6 border border-border h-full flex flex-col transition-all"
                  whileHover={{ y: -4, borderColor: `${B}40` }}
                >
                  <div className="flex mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} fill={Y} style={{ color: Y }} />
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-6 mt-3 italic">
                    &quot;{r.text}&quot;
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2"
                      style={{ borderColor: `${r.avatar}40` }}
                    >
                      <img src={r.photo} alt={r.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {r.name} {r.lang}
                      </p>
                      <p className="text-muted-foreground text-xs">{r.role}</p>
                    </div>
                    <div
                      className="ml-auto text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: `${G}15`, color: G }}
                    >
                      {r.score}
                    </div>
                  </div>
                </motion.div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. PRICING / CTA ────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-secondary/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          {/* Banner Photo */}
          <InView className="mb-12 rounded-3xl overflow-hidden relative h-52 border border-border">
            <img
              src="https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1400&h=320&fit=crop&auto=format"
              alt="Phố đi bộ Gyeongbokgung Seoul"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,110,255,0.88) 0%, rgba(0,153,212,0.8) 100%)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-2 backdrop-blur-sm">
                  <Zap size={12} /> Bắt đầu ngay hôm nay
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">
                  Chọn gói học phù hợp với bạn
                </h2>
                <p className="text-white/90 text-sm sm:text-base">
                  Dùng thử Pro miễn phí 7 ngày · Không cần thẻ tín dụng
                </p>
              </motion.div>
            </div>
          </InView>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <InView key={p.name} delay={i * 0.1}>
                <motion.div
                  className={`relative rounded-3xl p-6 border h-full flex flex-col ${
                    p.highlight ? "bg-card shadow-2xl border-primary" : "bg-card shadow-sm border-border"
                  }`}
                  whileHover={{ y: -6 }}
                >
                  {p.highlight && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-md"
                      style={{ background: `linear-gradient(90deg,${B},${C})` }}
                    >
                      ✨ Phổ biến nhất
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="text-sm font-bold mb-1" style={{ color: p.color }}>
                      {p.name}
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-foreground">{p.price}</span>
                      <span className="text-muted-foreground text-sm pb-1 font-semibold">
                        {p.sub}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2.5 mb-6 flex-1">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${p.color}20` }}
                        >
                          <Check size={10} style={{ color: p.color }} />
                        </div>
                        <span className="text-muted-foreground text-xs leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={p.href}
                    className="w-full py-3 rounded-2xl text-sm font-bold text-center block transition-all"
                    style={
                      p.highlight
                        ? {
                            background: `linear-gradient(90deg,${B},${C})`,
                            color: "#fff",
                            boxShadow: `0 4px 16px ${B}40`,
                          }
                        : {
                            border: `1.5px solid ${p.color}40`,
                            color: p.color,
                            backgroundColor: "var(--secondary)",
                          }
                    }
                  >
                    {p.cta}
                  </Link>
                </motion.div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. FOOTER ───────────────────────────────────────── */}
      <footer className="bg-card border-t border-border py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <AppMark size={32} className="w-8 h-8" />
                <AppWordmark className="text-base font-extrabold" />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nền tảng học tiếng Hàn &amp; tiếng Anh thông minh với AI, SRS và luyện thi chứng chỉ.
              </p>
            </div>
            {[
              {
                title: "Tính năng",
                links: [
                  "Từ vựng SRS",
                  "Luyện nói AI",
                  "Luyện thi TOPIK",
                  "Luyện thi TOEIC",
                  "Ngữ pháp & Lộ trình",
                ],
              },
              {
                title: "Học tập",
                links: [
                  "Tiếng Hàn",
                  "Tiếng Anh",
                  "TOPIK I & II",
                  "TOEIC L&R",
                  "Mini-games",
                ],
              },
              {
                title: "Hỗ trợ",
                links: ["Trung tâm trợ giúp", "Liên hệ", "Điều khoản", "Quyền riêng tư"],
              },
            ].map((g) => (
              <div key={g.title}>
                <p className="font-bold text-foreground text-sm mb-3">{g.title}</p>
                <div className="space-y-2">
                  {g.links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="block text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} {APP.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={12} />
              <span>SSL · Bảo mật dữ liệu học tập</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 13. FLOATING CTA ─────────────────────────────────── */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Link
          href="/register"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl"
          style={{
            background: `linear-gradient(90deg,${B},${C})`,
            boxShadow: `0 8px 32px ${B}60`,
          }}
        >
          <Sparkles size={15} /> Bắt đầu miễn phí
        </Link>
      </motion.div>
    </div>
  );
}
