"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BookOpen, ChevronDown, Dumbbell, Languages, Play } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, GRADIENT_DIAGONAL } from "@/components/ui-kit/brand";
import { Tag } from "@/components/ui-kit/primitives";
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

function LessonDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { lesson, error, loading } = useLesson(id);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <Link
        href="/lessons"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Tất cả bài học
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {lesson ? (
        <>
          <section className="relative mt-5 overflow-hidden rounded-[28px] border border-primary/15 bg-card p-7 shadow-[0_18px_50px_-34px_rgba(249,115,22,0.75)]">
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.13), transparent 52%, rgba(251,191,36,0.14))" }}
            />
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-8">
              <div className="flex min-w-0 items-start gap-5">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/25"
                  style={{ background: GRADIENT_DIAGONAL }}
                >
                  <Languages size={27} />
                </div>
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Tag color={BRAND.blue}>{lesson.languageCode.toUpperCase()}</Tag>
                    <Tag color={BRAND.cyan}>{LEVEL_LABEL[lesson.level]}</Tag>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {lesson.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {lesson.summary || "Học từ vựng, nắm cấu trúc ngữ pháp và củng cố kiến thức bằng bài luyện tập."}
                  </p>
                </div>
              </div>
              <Link
                href={`/lessons/${lesson.id}/learn`}
                className="relative flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                style={{ background: GRADIENT_DIAGONAL }}
              >
                <Play size={16} fill="currentColor" /> Học từ vựng
              </Link>
            </div>

            <div className="relative mt-7 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-background/55">
              <div className="px-5 py-3.5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Từ vựng</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{lesson.vocabulary.length}</p>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Điểm ngữ pháp</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{lesson.points.length}</p>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Bài luyện</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{lesson._count.exercises}</p>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[24px] border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Từ vựng</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">Từ của bài học</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen size={18} />
                </div>
              </div>
              {lesson.vocabulary.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-7 text-center text-sm text-muted-foreground">
                  Chưa có từ vựng trong bài này.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {lesson.vocabulary.map((w, index) => (
                  <div
                    key={w.id}
                    className="flex gap-3 rounded-xl border border-border bg-background/55 px-4 py-3 text-sm transition-colors hover:border-primary/30"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{w.frontText}</p>
                      <p className="mt-0.5 text-muted-foreground">{w.backText}</p>
                      {w.note ? <p className="mt-1 text-xs text-muted-foreground/70">{w.note}</p> : null}
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[24px] border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ngữ pháp</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">Cấu trúc cần nhớ</h2>
                </div>
              {lesson._count.exercises > 0 ? (
                <Link
                  href={`/lessons/${lesson.id}/practice`}
                  className="flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <Dumbbell size={15} /> Luyện tập
                </Link>
              ) : null}
            </div>
            {lesson.points.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-7 text-center text-sm text-muted-foreground">
                Chưa có điểm ngữ pháp trong bài này.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {lesson.points.map((p, index) => {
                  const open = openId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`overflow-hidden rounded-2xl border transition-colors ${
                        open ? "border-primary/35 bg-primary/[0.035]" : "border-border bg-background/45"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : p.id)}
                        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                        aria-expanded={open}
                      >
                        <div className="flex min-w-0 gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{p.title}</p>
                          {p.meaning ? (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {p.meaning}
                            </p>
                          ) : null}
                          </div>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`mt-1 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open ? (
                        <div className="space-y-4 border-t border-border px-5 py-4 text-sm">
                          {p.structure ? (
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Cấu trúc
                              </p>
                              <p className="mt-0.5 text-foreground/90">{p.structure}</p>
                            </div>
                          ) : null}
                          {p.example ? (
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Ví dụ
                              </p>
                              <p className="mt-0.5 text-foreground">{p.example}</p>
                              {p.translation ? (
                                <p className="mt-0.5 text-muted-foreground">
                                  {p.translation}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                          {p.note ? (
                            <p className="text-xs text-muted-foreground/70">{p.note}</p>
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
