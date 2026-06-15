"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopikFormatCard } from "@/components/topik/TopikFormatCard";
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
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <nav className="text-sm text-zinc-500">
        <Link href={`/topik/${tier}`} className="hover:text-zinc-800 dark:hover:text-zinc-200">
          Luyện tập
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-zinc-800 dark:text-zinc-200">
          {topikTierLabel(tier)}
        </span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-orange-500 text-white shadow-sm"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Link
          href="/topik/attempts"
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Lịch sử
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {tab !== "mock" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {formats === null ? (
            <p className="text-sm text-zinc-500 sm:col-span-2">Đang tải…</p>
          ) : sectionFormats.length === 0 ? (
            <p className="text-sm text-zinc-500 sm:col-span-2">
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
        <div className="mt-6">
          {exams === null ? (
            <p className="text-sm text-zinc-500">Đang tải…</p>
          ) : exams.length === 0 ? (
            <p className="text-sm text-zinc-500">Chưa có đề thi thử.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {exams.map((exam) => (
                <li key={exam.id}>
                  <Link
                    href={`/topik/exams/${exam.id}`}
                    className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-orange-200 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {exam.title}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {exam.questionCount} câu · {exam.durationMinutes} phút
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
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
