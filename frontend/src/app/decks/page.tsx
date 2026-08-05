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
  Sparkles,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useLearningLanguage } from "@/components/LearningLanguageProvider";
import { BRAND, pct } from "@/components/ui-kit/brand";
import { Bar, PageHeader, Stat } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { appendLanguageQuery } from "@/lib/learning-language-api";
import { learningLanguageLabel } from "@/lib/learning-language";
import type { DecksResponse } from "@/lib/types";

const PALETTE = [BRAND.blue, BRAND.cyan, BRAND.purple, BRAND.green] as const;

function DecksContent() {
  const { languageCode } = useLearningLanguage();
  const [data, setData] = useState<DecksResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(
        appendLanguageQuery("/decks", languageCode),
      );
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setData((await res.json()) as DecksResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách");
    }
  }, [languageCode]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Bộ thẻ của tôi"
        sub={`Tạo và quản lý bộ từ riêng — ${learningLanguageLabel(languageCode)}`}
        action={
          <Link
            href="/decks/new"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
              boxShadow: `0 4px 12px 0 ${BRAND.blue}40`,
            }}
          >
            <Plus size={16} /> Tạo bộ mới
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 rounded-2xl bg-red-500/10 p-3.5 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {data === null && !error ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : null}

      {data ? (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Số bộ thẻ" value={data.totals.decks} icon={<Layers size={18} />} color={BRAND.blue} delay={0.05} />
            <Stat label="Tổng thẻ từ" value={data.totals.cards} icon={<BookOpen size={18} />} color={BRAND.cyan} delay={0.1} />
            <Stat label="Đã thuộc" value={data.totals.learned} icon={<CheckCircle2 size={18} />} color={BRAND.green} delay={0.15} />
            <Stat label="Cần ôn lại" value={data.totals.weak} icon={<RefreshCw size={18} />} color={BRAND.yellow} delay={0.2} />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Danh sách bộ ({data.decks.length})
            </h2>
          </div>

          {data.decks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={24} />
              </div>
              <p className="text-base font-semibold text-foreground">Chưa có bộ thẻ nào</p>
              <p className="mt-1 text-sm text-muted-foreground">Tạo bộ thẻ để bắt đầu lưu từ vựng của riêng bạn.</p>
              <Link
                href="/decks/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})` }}
              >
                <Plus size={14} /> Tạo ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.decks.map((d, i) => {
                const p = pct(d.learned, d.total);
                const color = PALETTE[i % PALETTE.length];
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/decks/${d.id}`}
                      className="group relative block overflow-hidden rounded-3xl border bg-card p-5 transition-all duration-200 hover:-translate-y-1"
                      style={{
                        borderColor: `${color}25`,
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      {/* Top accent line */}
                      <div
                        className="absolute inset-x-0 top-0 h-[3px]"
                        style={{ background: `linear-gradient(90deg, ${color}, ${color}50)` }}
                      />

                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {d.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {d.total} thẻ trong bộ
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={{
                            background: `${color}15`,
                            color: color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {p}%
                        </span>
                      </div>

                      <div className="mt-3">
                        <Bar done={d.learned} total={d.total || 1} color={color} />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          Đã thuộc: <span className="font-bold text-foreground">{d.learned}/{d.total}</span>
                        </span>
                        {d.weak > 0 ? (
                          <span
                            className="rounded-lg px-2 py-0.5 font-semibold text-[11px]"
                            style={{ background: `${BRAND.yellow}18`, color: BRAND.yellow }}
                          >
                            Cần ôn {d.weak} thẻ
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-semibold text-[11px]">
                            ✓ Hoàn thành tốt
                          </span>
                        )}
                      </div>
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
