"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { languageLabel } from "@/lib/topic-labels";
import type { TopicRow } from "@/lib/types";

function groupByLevel(topics: TopicRow[]) {
  const map = new Map<string, TopicRow[]>();
  for (const t of topics) {
    const key = t.level?.trim() || "Chưa phân cấp";
    const list = map.get(key) ?? [];
    list.push(t);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "vi"))
    .map(([label, items]) => ({ label, items }));
}

function AdminTopicsContent() {
  const [topics, setTopics] = useState<TopicRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/admin/topics");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setTopics((await res.json()) as TopicRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(
    () => (topics ? groupByLevel(topics) : []),
    [topics],
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Quản trị chủ đề
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tạo, sửa, xóa chủ đề từ vựng và từ bên trong.
          </p>
        </div>
        <Link
          href="/admin/topics/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          + Tạo chủ đề mới
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {topics === null ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
      ) : topics.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Chưa có chủ đề.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {group.label}
                <span className="ml-2 font-normal text-zinc-500">
                  ({group.items.length} chủ đề)
                </span>
              </h2>
              <ul className="mt-2 flex flex-col gap-2">
                {group.items.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {t.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {languageLabel(t.languageCode)} · {t._count.words} từ
                      </p>
                    </div>
                    <Link
                      href={`/admin/topics/${t.id}/edit`}
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

      <p className="mt-8 text-sm">
        <Link
          href="/admin/lessons"
          className="text-zinc-600 hover:underline dark:text-zinc-400"
        >
          ← Quản trị bài học
        </Link>
      </p>
    </div>
  );
}

export default function AdminTopicsPage() {
  return (
    <AdminGate>
      <AdminTopicsContent />
    </AdminGate>
  );
}
