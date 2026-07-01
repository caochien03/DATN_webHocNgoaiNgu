"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Clock, History, Trophy } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { ToeicFormatCard } from "@/components/toeic/ToeicFormatCard";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
import { PageHeader } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { statsForToeicFormat } from "@/lib/toeic-format-stats";
import { toeicSectionLabel, toeicTierLabel } from "@/lib/toeic-labels";
import type {
  ToeicAttemptRow,
  ToeicExamRow,
  ToeicQuestionFormat,
  ToeicSection,
} from "@/lib/types";

type TabId = "listening" | "reading" | "mock";

const TABS: { id: TabId; label: string; section?: ToeicSection }[] = [
  { id: "listening", label: "Nghe", section: "LISTENING" },
  { id: "reading", label: "Đọc", section: "READING" },
  { id: "mock", label: "Thi thử" },
];

const TIER = "TOEIC_LR" as const;

function ToeicHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId =
    tabParam === "reading" || tabParam === "mock" ? tabParam : "listening";

  const [formats, setFormats] = useState<ToeicQuestionFormat[] | null>(null);
  const [exams, setExams] = useState<ToeicExamRow[] | null>(null);
  const [attempts, setAttempts] = useState<ToeicAttemptRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [formatsRes, examsRes, attemptsRes] = await Promise.all([
        fetchWithAuth(`/toeic/formats?tier=${TIER}`),
        fetchWithAuth(`/toeic/exams?tier=${TIER}`),
        fetchWithAuth("/toeic/attempts"),
      ]);
      if (!formatsRes.ok) {
        setError(await parseApiError(formatsRes));
        return;
      }
      setFormats((await formatsRes.json()) as ToeicQuestionFormat[]);
      if (examsRes.ok) {
        setExams((await examsRes.json()) as ToeicExamRow[]);
      } else {
        setExams([]);
      }
      if (attemptsRes.ok) {
        setAttempts((await attemptsRes.json()) as ToeicAttemptRow[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sectionFormats = useMemo(() => {
    if (!formats || tab === "mock") return [];
    const activeTab = TABS.find((t) => t.id === tab);
    if (!activeTab?.section) return [];
    return formats
      .filter((f) => f.section === activeTab.section)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [formats, tab]);

  function setTab(next: TabId) {
    const q = next === "listening" ? "" : `?tab=${next}`;
    router.push(`/toeic/${TIER}${q}`);
  }

  return (
    <div>
      <PageHeader
        title="Luyện thi TOEIC"
        sub={`${toeicTierLabel(TIER)} — Nghe, Đọc, Thi thử`}
        action={
          <Link
            href="/toeic/attempts"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <History size={14} /> Lịch sử
          </Link>
        }
      />

      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-border bg-secondary/40 p-1">
        {TABS.map((t) => {
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
                  layoutId="toeic-tab"
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
              Chưa có Part cho phần {toeicSectionLabel(tab === "reading" ? "READING" : "LISTENING")}.
            </p>
          ) : (
            sectionFormats.map((f) => (
              <ToeicFormatCard
                key={f.id}
                format={f}
                stats={statsForToeicFormat(attempts, f)}
                practiceHref={`/toeic/practice?tier=${TIER}&section=${f.section}&fromNo=${f.fromNo}&toNo=${f.toNo}`}
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
                    href={`/toeic/exams/${exam.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <span
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `linear-gradient(135deg,${BRAND.purple}20,${BRAND.blue}20)`,
                        color: BRAND.purple,
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

export default function ToeicHubPage() {
  return (
    <AuthGate>
      <ToeicHubContent />
    </AuthGate>
  );
}
