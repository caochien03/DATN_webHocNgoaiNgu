"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  Layers,
  Plus,
  RefreshCw,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, pct } from "@/components/ui-kit/brand";
import { Bar, PageHeader, Stat } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { DecksResponse } from "@/lib/types";

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

  return (
    <div>
      <PageHeader
        title="Bộ thẻ của tôi"
        sub="Tạo và quản lý bộ từ riêng — tiến độ học được ghi nhận"
        action={
          <Link
            href="/decks/new"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: `linear-gradient(90deg,${BRAND.blue},${BRAND.cyan})` }}
          >
            <Plus size={14} /> Bộ mới
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {data === null && !error ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : null}

      {data ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Số bộ" value={data.totals.decks} icon={<Layers size={18} />} color={BRAND.blue} delay={0.05} />
            <Stat label="Tổng thẻ" value={data.totals.cards} icon={<BookOpen size={18} />} color={BRAND.cyan} delay={0.1} />
            <Stat label="Đã thuộc" value={data.totals.learned} icon={<CheckCircle2 size={18} />} color={BRAND.green} delay={0.15} />
            <Stat label="Cần ôn" value={data.totals.weak} icon={<RefreshCw size={18} />} color={BRAND.yellow} delay={0.2} />
          </div>

          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Danh sách bộ ({data.decks.length})
          </h2>

          {data.decks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có bộ nào.{" "}
              <Link href="/decks/new" className="font-medium text-primary underline">
                Tạo bộ đầu tiên
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.decks.map((d, i) => {
                const p = pct(d.learned, d.total);
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/decks/${d.id}`}
                      className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="truncate font-semibold text-foreground">
                          {d.title}
                        </p>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {d.learned}/{d.total} ({p}%)
                        </span>
                      </div>
                      <Bar done={d.learned} total={d.total || 1} color={BRAND.blue} />
                      {d.weak > 0 ? (
                        <p className="mt-2 text-xs" style={{ color: BRAND.yellow }}>
                          Cần ôn lại {d.weak} thẻ
                        </p>
                      ) : null}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
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
