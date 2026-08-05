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
  ArrowRight,
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
    <div className="space-y-6">
      <PageHeader
        title="Bộ thẻ của tôi"
        sub={`Tự tạo và quản lý kho từ vựng cá nhân — ${learningLanguageLabel(languageCode)}`}
        action={
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/decks/new"
              className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition-all"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                boxShadow: `0 4px 14px 0 ${BRAND.blue}40`,
              }}
            >
              <Plus size={15} /> Tạo bộ thẻ mới
            </Link>
          </motion.div>
        }
      />

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 shadow-2xs">
          {error}
        </p>
      ) : null}

      {data === null && !error ? (
        <p className="text-xs font-bold text-muted-foreground">Đang tải bộ thẻ…</p>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <Stat label="Số bộ thẻ" value={data.totals.decks} icon={<Layers size={18} />} color={BRAND.blue} delay={0.05} />
            <Stat label="Tổng thẻ từ" value={data.totals.cards} icon={<BookOpen size={18} />} color={BRAND.cyan} delay={0.1} />
            <Stat label="Đã ghi nhớ" value={data.totals.learned} icon={<CheckCircle2 size={18} />} color={BRAND.green} delay={0.15} />
            <Stat label="Cần ôn tập" value={data.totals.weak} icon={<RefreshCw size={18} />} color={BRAND.yellow} delay={0.2} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Danh sách bộ thẻ ({data.decks.length})
            </h2>
          </div>

          {data.decks.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-10 text-center shadow-2xs">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Sparkles size={26} />
              </div>
              <p className="text-base font-black text-foreground">Bạn chưa có bộ thẻ nào</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Tạo bộ thẻ để ghi lại các từ vựng mới bạn bắt gặp trong quá trình học.
              </p>
              <Link
                href="/decks/new"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition-all"
                style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})` }}
              >
                <Plus size={14} /> Bắt đầu tạo ngay
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
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -3 }}
                  >
                    <Link
                      href={`/decks/${d.id}`}
                      className="group relative block overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                    >
                      {/* Top accent line */}
                      <div
                        className="absolute inset-x-0 top-0 h-[2.5px]"
                        style={{ background: `linear-gradient(90deg, ${color}, ${color}40)` }}
                      />

                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-black text-foreground transition-colors group-hover:text-primary">
                            {d.title}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                            {d.total} thẻ từ vựng
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-black"
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

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="font-bold text-muted-foreground">
                          Đã thuộc: <span className="font-black text-foreground">{d.learned}/{d.total}</span>
                        </span>
                        {d.weak > 0 ? (
                          <span
                            className="rounded-lg px-2 py-0.5 text-[11px] font-black"
                            style={{ background: `${BRAND.yellow}18`, color: BRAND.yellow }}
                          >
                            Cần ôn {d.weak} thẻ
                          </span>
                        ) : (
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            ✓ Đã ghi nhớ tốt
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
