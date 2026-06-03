"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { GRAMMAR_LEVELS } from "@/lib/grammar-levels";
import type { LessonRow } from "@/lib/types";

function AdminLessonsContent() {
  const [lessons, setLessons] = useState<LessonRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/admin/lessons");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setLessons((await res.json()) as LessonRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => {
    const map = new Map<string, LessonRow[]>();
    for (const { code } of GRAMMAR_LEVELS) map.set(code, []);
    for (const lesson of lessons ?? []) {
      const list = map.get(lesson.level) ?? [];
      list.push(lesson);
      map.set(lesson.level, list);
    }
    return GRAMMAR_LEVELS.map(({ code, label }) => ({
      code,
      label,
      items: map.get(code) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [lessons]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Quản trị bài học
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tạo, sửa, xóa bài học và nội dung bên trong.
          </p>
        </div>
        <Link
          href="/admin/lessons/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          + Tạo bài mới
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {lessons === null ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
      ) : lessons.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Chưa có bài học.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.code}>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {group.label}
                <span className="ml-2 font-normal text-zinc-500">
                  ({group.items.length} bài)
                </span>
              </h2>
              <ul className="mt-2 flex flex-col gap-2">
                {group.items.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {l.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {l._count.vocabulary} từ · {l._count.points} mục ngữ
                        pháp · {l._count.exercises} bài tập
                      </p>
                    </div>
                    <Link
                      href={`/admin/lessons/${l.id}/edit`}
                      className="shrink-0 text-sm text-zinc-700 hover:underline dark:text-zinc-300"
                    >
                      Sửa
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLessonsPage() {
  return (
    <AdminGate>
      <AdminLessonsContent />
    </AdminGate>
  );
}
