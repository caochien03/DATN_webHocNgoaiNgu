"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BookOpen, ChevronDown, Dumbbell, Languages, Play, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, GRADIENT_DIAGONAL, levelColor } from "@/components/ui-kit/brand";
import { Tag } from "@/components/ui-kit/primitives";
import { PathStepStatusCard } from "@/components/paths/PathStepStatusCard";
import { useLesson } from "@/lib/use-lesson";
import type { GrammarLevel } from "@/lib/types";

const LEVEL_LABEL: Record<GrammarLevel, string> = {
  BEGINNER_1: "Sơ cấp 1",
  BEGINNER_2: "Sơ cấp 2",
  INTERMEDIATE_1: "Trung cấp 1",
  INTERMEDIATE_2: "Trung cấp 2",
  ADVANCED_1: "Cao cấp 1",
  ADVANCED_2: "Cao cấp 2",
};

const PALETTE = [BRAND.blue, BRAND.cyan, BRAND.green, BRAND.purple, BRAND.red] as const;

function LessonDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { lesson, error, loading } = useLesson(id);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <Link
        href="/lessons"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Tất cả bài học
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {lesson ? (
        <>
          {/* Header Banner */}
          <section className="relative mt-4 overflow-hidden rounded-3xl border border-primary/15 bg-card p-6 shadow-sm md:p-8">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(249,115,22,0.14), transparent 55%, rgba(251,191,36,0.15))",
              }}
            />
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/25"
                  style={{ background: GRADIENT_DIAGONAL }}
                >
                  <Languages size={28} />
                </div>
                <div className="min-w-0">
                  <div className="mb-2.5 flex flex-wrap gap-2">
                    <Tag color={BRAND.blue}>{lesson.languageCode.toUpperCase()}</Tag>
                    <Tag color={BRAND.cyan}>{LEVEL_LABEL[lesson.level]}</Tag>
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {lesson.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {lesson.summary ||
                      "Học từ vựng, nắm cấu trúc ngữ pháp và củng cố kiến thức bằng bài luyện tập."}
                  </p>
                </div>
              </div>
              <Link
                href={`/lessons/${lesson.id}/learn`}
                className="relative flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 self-start"
                style={{
                  background: GRADIENT_DIAGONAL,
                  boxShadow: `0 4px 14px 0 ${BRAND.blue}40`,
                }}
              >
                <Play size={16} fill="currentColor" /> Bắt đầu học
              </Link>
            </div>

            <div className="relative mt-7 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-background/60 shadow-sm">
              <div className="px-5 py-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Từ vựng</p>
                <p className="mt-1 text-2xl font-black text-foreground">{lesson.vocabulary.length}</p>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ngữ pháp</p>
                <p className="mt-1 text-2xl font-black text-foreground">{lesson.points.length}</p>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bài luyện tập</p>
                <p className="mt-1 text-2xl font-black text-foreground">{lesson._count.exercises}</p>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            {/* Vocabulary Section */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.cyan})` }}
              />
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Từ vựng</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">Từ của bài học ({lesson.vocabulary.length})</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen size={18} />
                </div>
              </div>

              {lesson.vocabulary.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  Chưa có từ vựng trong bài này.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {lesson.vocabulary.map((w, index) => {
                    const c = PALETTE[index % PALETTE.length];
                    return (
                      <div
                        key={w.id}
                        className="group flex items-start gap-3 rounded-2xl border bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          borderColor: `${c}20`,
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        <span
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold text-white"
                          style={{ background: `linear-gradient(135deg, ${c}, ${c}80)` }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground">{w.frontText}</p>
                          <p className="mt-0.5 text-sm font-medium" style={{ color: c }}>
                            {w.backText}
                          </p>
                          {w.note ? (
                            <p
                              className="mt-1.5 rounded-lg px-2.5 py-1 text-xs leading-5 text-muted-foreground"
                              style={{ background: `${c}10` }}
                            >
                              {w.note}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Grammar Points Section */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.cyan})` }}
              />
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Ngữ pháp</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">Cấu trúc cần nhớ ({lesson.points.length})</h2>
                </div>
                {lesson._count.exercises > 0 ? (
                  <Link
                    href={`/lessons/${lesson.id}/practice`}
                    className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
                    }}
                  >
                    <Dumbbell size={14} /> Luyện tập
                  </Link>
                ) : null}
              </div>

              {lesson.points.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  Chưa có điểm ngữ pháp trong bài này.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {lesson.points.map((p, index) => {
                    const open = openId === p.id;
                    const c = PALETTE[index % PALETTE.length];
                    return (
                      <div
                        key={p.id}
                        className="overflow-hidden rounded-2xl border transition-all duration-200"
                        style={{
                          borderColor: open ? `${c}50` : `${c}20`,
                          backgroundColor: open ? `${c}08` : "var(--card)",
                          boxShadow: open ? `0 4px 16px 0 ${c}15` : "var(--shadow-card)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : p.id)}
                          className="flex w-full items-start justify-between gap-3 p-4 text-left"
                          aria-expanded={open}
                        >
                          <div className="flex min-w-0 gap-3">
                            <span
                              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                              style={{ background: `linear-gradient(135deg, ${c}, ${c}90)` }}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground text-base">{p.title}</p>
                              {p.meaning ? (
                                <p className="mt-0.5 text-sm font-medium" style={{ color: c }}>
                                  {p.meaning}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <ChevronDown
                            size={18}
                            className={`mt-1 shrink-0 text-muted-foreground transition-transform duration-200 ${
                              open ? "rotate-180 text-foreground" : ""
                            }`}
                          />
                        </button>
                        {open ? (
                          <div className="space-y-3.5 border-t border-border/80 px-5 pb-5 pt-4 text-sm">
                            {p.structure ? (
                              <div className="rounded-xl bg-background/80 p-3 border border-border">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Cấu trúc ngữ pháp
                                </p>
                                <p className="mt-1 font-mono font-bold text-foreground">{p.structure}</p>
                              </div>
                            ) : null}
                            {p.example ? (
                              <div className="rounded-xl bg-background/80 p-3 border border-border">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Ví dụ minh họa
                                </p>
                                <p className="mt-1 font-semibold text-foreground">{p.example}</p>
                                {p.translation ? (
                                  <p className="mt-1 text-sm font-medium italic" style={{ color: c }}>
                                    → {p.translation}
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                            {p.note ? (
                              <p className="text-xs text-muted-foreground/80 leading-relaxed bg-secondary/50 rounded-xl p-3">
                                💡 <span className="font-semibold text-foreground">Lưu ý:</span> {p.note}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <PathStepStatusCard sourceType="LESSON" sourceId={lesson.id} />
        </>
      ) : null}
    </div>
  );
}

export default function LessonDetailPage() {
  return (
    <AuthGate>
      <LessonDetailContent />
    </AuthGate>
  );
}
