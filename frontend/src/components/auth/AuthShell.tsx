"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BookOpen, Brain, MessageCircle, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppMark, AppWordmark } from "@/components/ui-kit/AppMark";
import { APP, BRAND } from "@/components/ui-kit/brand";

const FEATURES = [
  { icon: BookOpen, text: "Từ vựng theo chủ đề & bộ thẻ SRS" },
  { icon: Brain, text: "Lộ trình học cá nhân hóa theo trình độ" },
  { icon: MessageCircle, text: "Luyện nói với NPC bằng AI" },
  { icon: Sparkles, text: "Luyện thi & Chấm bài viết bằng AI" },
] as const;

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="relative hidden w-[46%] max-w-xl flex-col overflow-hidden border-r border-border bg-secondary lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 20% 20%, ${BRAND.blue}22, transparent),
              radial-gradient(ellipse 60% 50% at 80% 80%, ${BRAND.cyan}18, transparent)`,
          }}
        />
        <div className="relative flex flex-1 flex-col px-10 py-12">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <AppMark size={40} className="h-10 w-10" />
              <div>
                <AppWordmark className="text-base font-black leading-none" />
                <p className="mt-1 text-[11px] font-bold text-primary">{APP.tagline}</p>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          <div className="my-auto py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
                Bắt đầu từ hôm nay
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">
                Học ngoại ngữ thông minh
                <br />
                <span
                  style={{
                    background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  cùng Chingo
                </span>
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {APP.description} — ôn tập ngắt quãng thông minh, luyện nói phản xạ AI và theo dõi
                tiến độ mỗi ngày.
              </p>
            </motion.div>

            <ul className="mt-8 space-y-3">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-2xs"
                    style={{ backgroundColor: `${BRAND.blue}18`, color: BRAND.blue }}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="font-semibold text-xs text-foreground/90">{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="absolute right-5 top-5 lg:hidden">
          <ThemeToggle />
        </div>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <AppMark size={40} className="h-10 w-10" />
            <div>
              <AppWordmark className="text-base font-black leading-none" />
              <p className="mt-1 text-xs font-bold text-primary">{APP.tagline}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            <p className="mt-1.5 text-xs font-medium text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-6 text-center text-xs font-semibold text-muted-foreground">{footer}</p>
        </motion.div>
      </main>
    </div>
  );
}
