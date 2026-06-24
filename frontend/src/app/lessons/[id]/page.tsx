"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { GRADIENT } from "@/components/ui-kit/brand";
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
    <div className="mx-auto max-w-2xl">
      <Link
        href="/lessons"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {LEVEL_LABEL[lesson.level]}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">
                {lesson.title}
              </h1>
              {lesson.summary ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {lesson.summary}
                </p>
              ) : null}
            </div>
            <Link
              href={`/lessons/${lesson.id}/learn`}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: GRADIENT }}
            >
              <Play size={14} /> Học từ vựng
            </Link>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Từ vựng của bài ({lesson.vocabulary.length})
            </h2>
            {lesson.vocabulary.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có từ vựng trong bài này.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {lesson.vocabulary.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
                  >
                    <p className="font-semibold text-foreground">{w.frontText}</p>
                    <p className="text-muted-foreground">{w.backText}</p>
                    {w.note ? (
                      <p className="mt-1 text-xs text-muted-foreground/70">{w.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">
                Ngữ pháp của bài ({lesson.points.length})
              </h2>
              {lesson._count.exercises > 0 ? (
                <Link
                  href={`/lessons/${lesson.id}/practice`}
                  className="rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Luyện tập ({lesson._count.exercises})
                </Link>
              ) : null}
            </div>
            {lesson.points.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có điểm ngữ pháp trong bài này.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {lesson.points.map((p) => {
                  const open = openId === p.id;
                  return (
                    <div
                      key={p.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : p.id)}
                        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                        aria-expanded={open}
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{p.title}</p>
                          {p.meaning ? (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {p.meaning}
                            </p>
                          ) : null}
                        </div>
                        <ChevronDown
                          size={16}
                          className={`mt-0.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open ? (
                        <div className="space-y-2 border-t border-border px-4 py-3 text-sm">
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
