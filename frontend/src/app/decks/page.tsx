"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { DecksResponse } from "@/lib/types";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function DecksContent() {
  const [data, setData] = useState<DecksResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/decks");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setData((await res.json()) as DecksResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const learnedPercent =
    data && data.totals.cards > 0
      ? Math.round((data.totals.learned / data.totals.cards) * 100)
      : 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Bộ từ của tôi
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tạo và quản lý bộ từ riêng. Tiến độ học được ghi nhận cho các bộ này.
          </p>
        </div>
        <Link
          href="/decks/new"
          className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          + Bộ mới
        </Link>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {data === null && !error ? (
        <p className="text-sm text-zinc-500">Đang tải…</p>
      ) : null}

      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Số bộ" value={data.totals.decks} />
            <StatCard label="Tổng thẻ" value={data.totals.cards} />
            <StatCard
              label="Đã thuộc"
              value={data.totals.learned}
              hint={`${learnedPercent}% tổng thẻ`}
            />
            <StatCard label="Cần ôn" value={data.totals.weak} />
          </section>
          <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Đã ôn" value={data.totals.reviewed} />
            <StatCard label="Ôn hôm nay" value={data.totals.reviewedToday} />
            <StatCard
              label="7 ngày qua"
              value={data.totals.reviewedLast7Days}
            />
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Danh sách bộ ({data.decks.length})
            </h2>
            {data.decks.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Chưa có bộ nào.{" "}
                <Link href="/decks/new" className="font-medium underline">
                  Tạo bộ đầu tiên
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {data.decks.map((d) => {
                  const pct =
                    d.total > 0 ? Math.round((d.learned / d.total) * 100) : 0;
                  return (
                    <li key={d.id}>
                      <Link
                        href={`/decks/${d.id}`}
                        className="block rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                            {d.title}
                          </p>
                          <p className="shrink-0 text-xs text-zinc-500">
                            {d.learned}/{d.total} ({pct}%)
                            {d.weak > 0 ? (
                              <span className="ml-2 text-amber-600 dark:text-amber-300">
                                · sai {d.weak}
                              </span>
                            ) : null}
                          </p>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className="h-full bg-zinc-900 dark:bg-zinc-100"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
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

export default function DecksPage() {
  return (
    <AuthGate>
      <DecksContent />
    </AuthGate>
  );
}
