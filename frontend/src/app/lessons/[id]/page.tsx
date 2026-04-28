"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
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
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        href="/lessons"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Tất cả bài học
      </Link>

      {loading ? <p className="mt-6 text-sm text-zinc-500">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {lesson ? (
        <>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                {LEVEL_LABEL[lesson.level]}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {lesson.title}
              </h1>
              {lesson.summary ? (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {lesson.summary}
                </p>
              ) : null}
            </div>
            <Link
              href={`/lessons/${lesson.id}/learn`}
              className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Học từ vựng
            </Link>
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Từ vựng của bài ({lesson.vocabulary.length})
            </h2>
            {lesson.vocabulary.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">
                Chưa có từ vựng trong bài này.
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {lesson.vocabulary.map((w) => (
                  <li
                    key={w.id}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {w.frontText}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {w.backText}
                    </p>
                    {w.note ? (
                      <p className="mt-1 text-xs text-zinc-500">{w.note}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Ngữ pháp của bài ({lesson.points.length})
              </h2>
              {lesson._count.exercises > 0 ? (
                <Link
                  href={`/lessons/${lesson.id}/practice`}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Luyện tập ({lesson._count.exercises})
                </Link>
              ) : null}
            </div>
            {lesson.points.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">
                Chưa có điểm ngữ pháp trong bài này.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {lesson.points.map((p) => {
                  const open = openId === p.id;
                  return (
                    <li
                      key={p.id}
                      className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : p.id)}
                        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                        aria-expanded={open}
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {p.title}
                          </p>
                          {p.meaning ? (
                            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                              {p.meaning}
                            </p>
                          ) : null}
                        </div>
                        <span className="self-center text-zinc-400">
                          {open ? "▾" : "▸"}
                        </span>
                      </button>
                      {open ? (
                        <div className="space-y-2 border-t border-zinc-100 px-4 py-3 text-sm dark:border-zinc-800">
                          {p.structure ? (
                            <div>
                              <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Cấu trúc
                              </p>
                              <p className="mt-0.5 text-zinc-800 dark:text-zinc-200">
                                {p.structure}
                              </p>
                            </div>
                          ) : null}
                          {p.example ? (
                            <div>
                              <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Ví dụ
                              </p>
                              <p className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                                {p.example}
                              </p>
                              {p.translation ? (
                                <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                                  {p.translation}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                          {p.note ? (
                            <p className="text-xs text-zinc-500">{p.note}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
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
