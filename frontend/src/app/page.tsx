"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  Play,
  Route,
  Target,
  Trophy,
  Sparkles,
  Layers,
  Mic,
} from "lucide-react";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { Bar, Stat } from "@/components/ui-kit/primitives";
import { BRAND } from "@/components/ui-kit/brand";
import { fetchWithAuth } from "@/lib/api-fetch";
import { getStoredAuth } from "@/lib/auth-storage";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import type { DecksTotals, GoalMeResponse } from "@/lib/types";
import { LandingPage } from "@/components/home/LandingPage";

type Loaded = {
  goal: GoalMeResponse | null;
  due: number | null;
  totals: DecksTotals | null;
};

const QUICK_BASE = [
  { label: "Học từ vựng", sub: "Chủ đề theo cấp độ", icon: BookOpen, color: BRAND.blue, href: "/topics" },
  { label: "Bài ngữ pháp", sub: "Điểm ngữ pháp & bài tập", icon: GraduationCap, color: BRAND.cyan, href: "/lessons" },
  { label: "Lộ trình học", sub: "Theo từng bước có cấu trúc", icon: Route, color: BRAND.yellow, href: "/paths" },
  { label: "Luyện nói AI", sub: "Hội thoại giọng nói thông minh", icon: Mic, color: BRAND.green, href: "/speaking" },
] as const;

export default function Home() {
  const { languageCode } = useLearningLanguage();
  const [name, setName] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<Loaded>({ goal: null, due: null, totals: null });

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    setName(auth.user.name || auth.user.email);

    void fetchWithAuth(appendLanguageQuery("/goals/me", languageCode))
      .then((r) => (r.ok ? r.json() : null))
      .then((goal: GoalMeResponse | null) => setData((d) => ({ ...d, goal })))
      .catch(() => {});
    void fetchWithAuth(appendLanguageQuery("/review/today/summary", languageCode))
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setData((d) => ({ ...d, due: s?.dueCount ?? null })))
      .catch(() => {});
    void fetchWithAuth(appendLanguageQuery("/decks", languageCode))
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => setData((d) => ({ ...d, totals: res?.totals ?? null })))
      .catch(() => {});
  }, [languageCode]);

  // Loading initial auth check state
  if (authed === null) {
    return null;
  }

  // Not authenticated: render the modern Landing Page
  if (!authed) {
    return <LandingPage />;
  }

  // Authenticated: render the Learning Dashboard
  const goal = data.goal;
  const streak = goal?.streak ?? 0;
  const reviewed = goal?.today.reviewedCards ?? 0;
  const target = goal?.today.target ?? 0;
  const percent = goal?.today.percent ?? 0;

  const examQuick =
    languageCode === "en"
      ? {
          label: "Luyện thi TOEIC",
          sub: "Nghe · Đọc · Làm đề thi",
          icon: Brain,
          color: BRAND.purple,
          href: "/toeic/TOEIC_LR",
        }
      : {
          label: "Luyện thi TOPIK",
          sub: "TOPIK I & II chuẩn đề",
          icon: Brain,
          color: BRAND.purple,
          href: "/topik/TOPIK_I",
        };

  const quickLinks = [QUICK_BASE[0], examQuick, QUICK_BASE[1], QUICK_BASE[2]];

  return (
    <div className="space-y-6">
      {/* Radiant Welcome Banner */}
      <motion.div
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${BRAND.blue} 0%, #1e40af 50%, ${BRAND.cyan} 100%)`,
          boxShadow: `0 20px 45px -20px ${BRAND.blue}80`,
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Glow ambient effects */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-cyan-400/20 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black text-white backdrop-blur-md">
                <Flame size={15} className="text-amber-300" />
                {streak} ngày học liên tiếp
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/30 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
                <Sparkles size={13} /> {languageCode === "ko" ? "Tiếng Hàn" : "Tiếng Anh"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Chào mừng trở lại, {name}!
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm font-medium text-white/85">
              Hôm nay bạn có{" "}
              <strong className="font-black text-white underline underline-offset-2">
                {data.due ?? "—"} thẻ từ vựng
              </strong>{" "}
              cần ôn tập ngắt quãng (SRS).
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/review/today"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs font-black text-primary shadow-lg transition-colors hover:bg-slate-50"
            >
              <Play size={15} className="fill-primary" />
              <span>Bắt đầu ôn tập ngay</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Stat label="Chuỗi ngày" value={`${streak}`} icon={<Flame size={18} />} color={BRAND.yellow} delay={0.06} />
        <Stat label="Thẻ hôm nay" value={`${reviewed}/${target}`} icon={<Target size={18} />} color={BRAND.blue} delay={0.12} />
        <Stat label="Từ đã thuộc" value={data.totals?.learned ?? 0} icon={<BookOpen size={18} />} color={BRAND.cyan} delay={0.18} />
        <Stat label="Bộ thẻ đang học" value={data.totals?.decks ?? 0} icon={<Trophy size={18} />} color={BRAND.purple} delay={0.24} />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today Goal Widget */}
          <motion.div
            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                <h3 className="text-sm font-black text-foreground">Mục tiêu ôn tập hôm nay</h3>
              </div>
              <Link
                href="/goals"
                className="flex items-center gap-1 text-xs font-black text-primary transition hover:underline"
              >
                Cài đặt mục tiêu <ArrowRight size={13} />
              </Link>
            </div>
            <div className="mb-2.5 flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">Tiến độ lượt ôn thẻ</span>
              <span className="font-mono text-xs font-black text-foreground">
                {reviewed}/{target} ({percent}%)
              </span>
            </div>
            <Bar done={reviewed} total={target || 1} color={BRAND.blue} />
          </motion.div>

          {/* Quick Hub Grid */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {quickLinks.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + i * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    href={a.href}
                    className="group flex items-center gap-3.5 rounded-3xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${a.color}20, ${a.color}10)`,
                        color: a.color,
                        border: `1px solid ${a.color}30`,
                      }}
                    >
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-foreground">{a.label}</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-muted-foreground">{a.sub}</p>
                    </div>
                    <ArrowRight
                      size={15}
                      className="text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-muted-foreground">
              Đường dẫn nhanh
            </h3>
            <div className="space-y-1">
              <Link
                href={languageCode === "en" ? "/toeic/TOEIC_LR" : "/topik/TOPIK_I"}
                className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-foreground transition hover:bg-secondary"
              >
                <span>{languageCode === "en" ? "🏆 Luyện thi TOEIC" : "🏆 Luyện thi TOPIK"}</span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </Link>
              <Link
                href="/decks"
                className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-foreground transition hover:bg-secondary"
              >
                <span>🃏 Quản lý Bộ thẻ tự tạo</span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </Link>
              <Link
                href="/paths"
                className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-foreground transition hover:bg-secondary"
              >
                <span>🗺️ Lộ trình học bài bản</span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </Link>
              <Link
                href="/speaking"
                className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-foreground transition hover:bg-secondary"
              >
                <span>🎙️ Luyện nói phản xạ AI</span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </Link>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/review/today"
                className="mt-5 block w-full rounded-2xl py-2.5 text-center text-xs font-black text-white shadow-md transition-all"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                  boxShadow: `0 4px 14px 0 ${BRAND.blue}35`,
                }}
              >
                Ôn thẻ SRS hôm nay
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
