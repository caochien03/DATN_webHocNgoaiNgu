"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { GRADIENT } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
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
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Quản trị chủ đề"
        sub="Tạo, sửa, xóa chủ đề từ vựng và từ bên trong"
        action={
          <Link
            href="/admin/topics/new"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} /> Tạo chủ đề mới
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {topics === null ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có chủ đề.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="text-sm font-semibold text-foreground">
                {group.label}
                <span className="ml-2 font-normal text-muted-foreground">
                  ({group.items.length} chủ đề)
                </span>
              </h2>
              <ul className="mt-2 flex flex-col gap-2">
                {group.items.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {languageLabel(t.languageCode)} · {t._count.words} từ
                      </p>
                    </div>
                    <Link
                      href={`/admin/topics/${t.id}/edit`}
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

      <p className="mt-8 text-sm">
        <Link
          href="/admin/lessons"
          className="text-muted-foreground transition-colors hover:text-foreground"
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
