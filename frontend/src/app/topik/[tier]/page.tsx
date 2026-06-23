"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Clock, History, Trophy } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { TopikFormatCard } from "@/components/topik/TopikFormatCard";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { statsForFormat } from "@/lib/topik-format-stats";
import { topikTierLabel } from "@/lib/topik-labels";
import type {
  TopikAttemptRow,
  TopikExamRow,
  TopikQuestionFormat,
  TopikSection,
  TopikTier,
} from "@/lib/types";

const VALID_TIERS = new Set<TopikTier>(["TOPIK_I", "TOPIK_II"]);
type TabId = "listening" | "reading" | "writing" | "mock";

const TABS_TOPIK_I: { id: TabId; label: string; section?: TopikSection }[] = [
  { id: "listening", label: "Nghe", section: "LISTENING" },
  { id: "reading", label: "Đọc", section: "READING" },
  { id: "mock", label: "Thi thử" },
];

const TABS_TOPIK_II: { id: TabId; label: string; section?: TopikSection }[] = [
  { id: "listening", label: "Nghe", section: "LISTENING" },
  { id: "reading", label: "Đọc", section: "READING" },
  { id: "writing", label: "Viết", section: "WRITING" },
  { id: "mock", label: "Thi thử" },
];

function TierPracticeContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierParam = params.tier as string;
  const tier = VALID_TIERS.has(tierParam as TopikTier)
    ? (tierParam as TopikTier)
    : null;

  const tabParam = searchParams.get("tab");
  const tabs = tier === "TOPIK_II" ? TABS_TOPIK_II : TABS_TOPIK_I;
  const tab: TabId =
    tabParam === "reading" ||
    tabParam === "writing" ||
    tabParam === "mock"
      ? tabParam
      : "listening";

  const [formats, setFormats] = useState<TopikQuestionFormat[] | null>(null);
  const [exams, setExams] = useState<TopikExamRow[] | null>(null);
  const [attempts, setAttempts] = useState<TopikAttemptRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tier) return;
    setError(null);
    try {
      const [formatsRes, examsRes, attemptsRes] = await Promise.all([
        fetchWithAuth(`/topik/formats?tier=${tier}`),
        fetchWithAuth(`/topik/exams?tier=${tier}`),
        fetchWithAuth("/topik/attempts"),
      ]);
      if (!formatsRes.ok) {
        setError(await parseApiError(formatsRes));
        return;
      }
      setFormats((await formatsRes.json()) as TopikQuestionFormat[]);
      if (examsRes.ok) {
        setExams((await examsRes.json()) as TopikExamRow[]);
      } else {
        setExams([]);
      }
      if (attemptsRes.ok) {
        setAttempts((await attemptsRes.json()) as TopikAttemptRow[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
    }
  }, [tier]);

  useEffect(() => {
    if (!tier) {
      router.replace("/topik/TOPIK_I");
      return;
    }
    void load();
  }, [tier, load, router]);

  const sectionFormats = useMemo(() => {
    if (!formats || tab === "mock") return [];
    const activeTab = tabs.find((t) => t.id === tab);
    if (!activeTab?.section) return [];
    return formats
      .filter((f) => f.section === activeTab.section)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [formats, tab, tabs]);

  function setTab(next: TabId) {
    const q = next === "listening" ? "" : `?tab=${next}`;
    router.push(`/topik/${tier}${q}`);
  }

  if (!tier) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Luyện thi TOPIK"
        sub={`${topikTierLabel(tier)} — Nghe, Đọc${tier === "TOPIK_II" ? ", Viết" : ""}, Thi thử`}
        action={
          <Link
            href="/topik/attempts"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <History size={14} /> Lịch sử
          </Link>
        }
      />

      <div className="mb-6 flex gap-2">
        {(["TOPIK_I", "TOPIK_II"] as const).map((t) => {
          const active = tier === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => router.push(`/topik/${t}`)}
              className="relative rounded-xl px-6 py-2 text-sm font-bold"
              style={{ color: active ? "#fff" : BRAND.muted }}
            >
              {active ? (
                <motion.span
                  layoutId="topik-level"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: GRADIENT }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : (
                <span
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                />
              )}
              <span className="relative">{topikTierLabel(t)}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-border bg-secondary/40 p-1">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="relative rounded-lg px-5 py-2 text-sm font-medium"
              style={{ color: active ? "#fff" : BRAND.muted }}
            >
              {active ? (
                <motion.span
                  layoutId="topik-tab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: GRADIENT }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {tab !== "mock" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {formats === null ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">Đang tải…</p>
          ) : sectionFormats.length === 0 ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Chưa có dạng bài cho cấp độ này.
            </p>
          ) : (
            sectionFormats.map((f, i) => (
              <TopikFormatCard
                key={f.id}
                partIndex={i + 1}
                format={f}
                stats={statsForFormat(attempts, f)}
                practiceHref={`/topik/practice?tier=${tier}&section=${f.section}&fromNo=${f.fromNo}&toNo=${f.toNo}`}
              />
            ))
          )}
        </div>
      ) : (
        <div>
          {exams === null ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : exams.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có đề thi thử.</p>
          ) : (
            <div className="space-y-4">
              {exams.map((exam, i) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={`/topik/exams/${exam.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <span
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `linear-gradient(135deg,${BRAND.blue}20,${BRAND.cyan}20)`,
                        color: BRAND.blue,
                      }}
                    >
                      <Trophy size={20} />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{exam.title}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} /> {exam.durationMinutes} phút
                        </span>
                        <span>{exam.questionCount} câu</span>
                      </div>
                    </div>
                    <span
                      className="rounded-xl px-5 py-2 text-sm font-semibold text-white"
                      style={{ background: GRADIENT }}
                    >
                      Vào thi
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopikTierPage() {
  return (
    <AuthGate>
      <TierPracticeContent />
    </AuthGate>
  );
}
