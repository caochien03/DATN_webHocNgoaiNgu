"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { languageLabel } from "@/lib/topic-labels";
import type { AdminPathCatalogRow } from "@/lib/types";

function groupByLevel(paths: AdminPathCatalogRow[]) {
  const map = new Map<string, AdminPathCatalogRow[]>();
  for (const p of paths) {
    const key = p.level?.trim() || "Chưa phân cấp";
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "vi"))
    .map(([label, items]) => ({ label, items }));
}

function AdminPathsContent() {
  const [paths, setPaths] = useState<AdminPathCatalogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/admin/paths");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setPaths((await res.json()) as AdminPathCatalogRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(
    () => (paths ? groupByLevel(paths) : []),
    [paths],
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Quản trị lộ trình
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tạo, sửa, xóa lộ trình và các bước (chủ đề / bài học).
          </p>
        </div>
        <Link
          href="/admin/paths/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          + Tạo lộ trình mới
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {paths === null ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
      ) : paths.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Chưa có lộ trình.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {group.label}
                <span className="ml-2 font-normal text-zinc-500">
                  ({group.items.length} lộ trình)
                </span>
              </h2>
              <ul className="mt-2 flex flex-col gap-2">
                {group.items.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {p.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {languageLabel(p.languageCode)} · {p._count.steps} bước
                      </p>
                    </div>
                    <Link
                      href={`/admin/paths/${p.id}/edit`}
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

export default function AdminPathsPage() {
  return (
    <AdminGate>
      <AdminPathsContent />
    </AdminGate>
  );
}
