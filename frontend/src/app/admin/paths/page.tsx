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
  const [language, setLanguage] = useState<AdminLanguageFilterValue>("");
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

  const filteredPaths = useMemo(
    () => paths?.filter((path) => !language || path.languageCode === language) ?? null,
    [language, paths],
  );
  const groups = useMemo(
    () => (filteredPaths ? groupByLevel(filteredPaths) : []),
    [filteredPaths],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Quản trị lộ trình"
        sub="Tạo, sửa, xóa lộ trình và các bước (chủ đề / bài học)"
        action={
          <Link
            href="/admin/paths/new"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} /> Tạo lộ trình mới
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

      {paths === null ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : filteredPaths?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có lộ trình cho ngôn ngữ đã chọn.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="text-sm font-semibold text-foreground">
                {group.label}
                <span className="ml-2 font-normal text-muted-foreground">
                  ({group.items.length} lộ trình)
                </span>
              </h2>
              <ul className="mt-2 flex flex-col gap-2">
                {group.items.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{p.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <AdminLanguageBadge code={p.languageCode} />
                        <span className="text-xs text-muted-foreground">
                          {p._count.steps} bước
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/paths/${p.id}/edit`}
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

export default function AdminPathsPage() {
  return (
    <AdminGate>
      <AdminPathsContent />
    </AdminGate>
  );
}
