"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import {
  AdminLanguageBadge,
  AdminLanguageFilter,
  type AdminLanguageFilterValue,
} from "@/components/admin/AdminLanguageControls";
import { GRADIENT } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { GRAMMAR_LEVELS } from "@/lib/grammar-levels";
import type { LessonRow } from "@/lib/types";

function AdminLessonsContent() {
  const [lessons, setLessons] = useState<LessonRow[] | null>(null);
  const [language, setLanguage] = useState<AdminLanguageFilterValue>("");
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
    for (const lesson of lessons?.filter(
      (row) => !language || row.languageCode === language,
    ) ?? []) {
      const list = map.get(lesson.level) ?? [];
      list.push(lesson);
      map.set(lesson.level, list);
    }
    return GRAMMAR_LEVELS.map(({ code, label }) => ({
      code,
      label,
      items: map.get(code) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [language, lessons]);

  const filteredLessons = lessons?.filter(
    (lesson) => !language || lesson.languageCode === language,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Quản trị bài học"
        sub="Tạo, sửa, xóa bài học và nội dung bên trong"
        action={
          <Link
            href="/admin/lessons/new"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} /> Tạo bài mới
          </Link>
        }
      />

      <div className="mb-5">
        <AdminLanguageFilter value={language} onChange={setLanguage} />
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {lessons === null ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : filteredLessons?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có bài học cho ngôn ngữ đã chọn.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.code}>
              <h2 className="text-sm font-semibold text-foreground">
                {group.label}
                <span className="ml-2 font-normal text-muted-foreground">
                  ({group.items.length} bài)
                </span>
              </h2>
              <ul className="mt-2 flex flex-col gap-2">
                {group.items.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{l.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <AdminLanguageBadge code={l.languageCode} />
                        <span className="text-xs text-muted-foreground">
                          {l._count.vocabulary} từ · {l._count.points} mục ngữ
                          pháp · {l._count.exercises} bài tập
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/lessons/${l.id}/edit`}
                      className="shrink-0 text-sm font-medium text-primary hover:underline"
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
