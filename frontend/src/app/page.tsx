/* eslint-disable react-hooks/set-state-in-effect */
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
} from "lucide-react";
import { Bar, Stat } from "@/components/ui-kit/primitives";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
import { fetchWithAuth } from "@/lib/api-fetch";
import { getStoredAuth } from "@/lib/auth-storage";
import type { DecksTotals, GoalMeResponse } from "@/lib/types";

type Loaded = {
  goal: GoalMeResponse | null;
  due: number | null;
  totals: DecksTotals | null;
};

const QUICK = [
  { label: "Học từ vựng", sub: "Chủ đề theo cấp độ", icon: BookOpen, color: BRAND.blue, href: "/topics" },
  { label: "Luyện TOPIK", sub: "Nghe · Đọc · Viết · Thi", icon: Brain, color: BRAND.purple, href: "/topik/TOPIK_I" },
  { label: "Bài ngữ pháp", sub: "Điểm ngữ pháp & bài tập", icon: GraduationCap, color: BRAND.cyan, href: "/lessons" },
  { label: "Lộ trình học", sub: "Theo từng bước", icon: Route, color: BRAND.yellow, href: "/paths" },
];

export default function Home() {
  const [name, setName] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<Loaded>({ goal: null, due: null, totals: null });

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    setName(auth.user.name || auth.user.email);

    void fetchWithAuth("/goals/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((goal: GoalMeResponse | null) => setData((d) => ({ ...d, goal })))
      .catch(() => {});
    void fetchWithAuth("/review/today/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setData((d) => ({ ...d, due: s?.dueCount ?? null })))
      .catch(() => {});
    void fetchWithAuth("/decks")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => setData((d) => ({ ...d, totals: res?.totals ?? null })))
      .catch(() => {});
  }, []);

  if (!authed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold text-white"
          style={{ background: `linear-gradient(135deg,${BRAND.blue},${BRAND.cyan})` }}
        >
          한
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Học tiếng Hàn cùng Chín Chín
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Từ vựng theo chủ đề, ôn tập SRS, luyện thi TOPIK và chấm viết bằng AI —
          bắt đầu hành trình từ số 0.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/register"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            Tạo tài khoản
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  const goal = data.goal;
  const streak = goal?.streak ?? 0;
  const reviewed = goal?.today.reviewedCards ?? 0;
  const target = goal?.today.target ?? 0;
  const percent = goal?.today.percent ?? 0;

  return (
    <div>
      <motion.div
        className="relative mb-6 overflow-hidden rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg,#0a1230 0%,#0d1a3a 50%,#0a1528 100%)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <Flame size={18} style={{ color: BRAND.yellow }} />
            <span className="text-sm font-semibold" style={{ color: BRAND.yellow }}>
              {streak} ngày liên tiếp
            </span>
          </div>
          <h1 className="mb-1 text-xl font-bold text-foreground">
            Xin chào, {name}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Bạn có{" "}
            <span className="font-semibold" style={{ color: BRAND.cyan }}>
              {data.due ?? "—"} thẻ
            </span>{" "}
            cần ôn tập hôm nay.
          </p>
          <Link
            href="/review/today"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Play size={14} /> Ôn tập ngay
          </Link>
        </div>
      </motion.div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Chuỗi ngày" value={`${streak}`} icon={<Flame size={18} />} color={BRAND.yellow} delay={0.08} />
        <Stat label="Thẻ hôm nay" value={`${reviewed}/${target}`} icon={<Target size={18} />} color={BRAND.blue} delay={0.14} />
        <Stat label="Từ đã học" value={data.totals?.learned ?? 0} icon={<BookOpen size={18} />} color={BRAND.cyan} delay={0.2} />
        <Stat label="Bộ thẻ" value={data.totals?.decks ?? 0} icon={<Trophy size={18} />} color={BRAND.purple} delay={0.26} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <motion.div
            className="rounded-2xl border border-border bg-card p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Mục tiêu hôm nay</h3>
              <Link
                href="/goals"
                className="flex items-center gap-1 text-xs"
                style={{ color: BRAND.blue }}
              >
                Chi tiết <ArrowRight size={12} />
              </Link>
            </div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-foreground">Ôn thẻ SRS</span>
              <span className="font-mono text-xs text-muted-foreground">
                {reviewed}/{target} ({percent}%)
              </span>
            </div>
            <Bar done={reviewed} total={target || 1} color={BRAND.blue} />
          </motion.div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUICK.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <Link
                    href={a.href}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <span
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${a.color}18`, color: a.color }}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{a.label}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.sub}</p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground transition-colors group-hover:text-foreground"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Tiếp tục học</h3>
            <div className="space-y-2 text-sm">
              <Link href="/topik/TOPIK_I" className="flex items-center justify-between border-b border-border py-2 text-muted-foreground transition-colors last:border-0 hover:text-foreground">
                Thi thử TOPIK <ArrowRight size={13} />
              </Link>
              <Link href="/decks" className="flex items-center justify-between border-b border-border py-2 text-muted-foreground transition-colors last:border-0 hover:text-foreground">
                Bộ thẻ của tôi <ArrowRight size={13} />
              </Link>
              <Link href="/paths" className="flex items-center justify-between border-b border-border py-2 text-muted-foreground transition-colors last:border-0 hover:text-foreground">
                Lộ trình học <ArrowRight size={13} />
              </Link>
            </div>
            <Link
              href="/review/today"
              className="mt-3 block w-full rounded-xl py-2 text-center text-sm font-semibold text-white"
              style={{ background: GRADIENT }}
            >
              Bắt đầu ôn
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
