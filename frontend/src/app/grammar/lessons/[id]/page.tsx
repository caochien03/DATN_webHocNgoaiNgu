"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { GrammarLessonDetail, GrammarLevel } from "@/lib/types";

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

  const [lesson, setLesson] = useState<GrammarLessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/grammar/lessons/${id}`);
      if (res.status === 404) {
        setError("Không tìm thấy bài ngữ pháp.");
        return;
      }
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setLesson((await res.json()) as GrammarLessonDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được bài");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        href="/grammar"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Tất cả cấp độ
      </Link>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {lesson ? (
        <>
          <div className="mt-4">
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

          <section className="mt-6">
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Các điểm ngữ pháp ({lesson.points.length})
            </h2>
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
      ) : !error ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
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
