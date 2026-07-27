"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpenCheck,
  Clock,
  FileText,
  Headphones,
  History,
  Trophy,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { TopikFormatCard } from "@/components/topik/TopikFormatCard";
import { BRAND, GRADIENT, GRADIENT_DIAGONAL } from "@/components/ui-kit/brand";
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

function tabFromSearchParam(value: string | null): TabId {
  if (value === "reading" || value === "writing" || value === "mock") {
    return value;
  }
  return "listening";
}

function TierPracticeContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierParam = params.tier as string;
  const tier = VALID_TIERS.has(tierParam as TopikTier)
    ? (tierParam as TopikTier)
    : null;

  const tabs = tier === "TOPIK_II" ? TABS_TOPIK_II : TABS_TOPIK_I;
  const searchTab = tabFromSearchParam(searchParams.get("tab"));
  const [tab, setTab] = useState<TabId>(searchTab);

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

  useEffect(() => {
    setTab(searchTab);
  }, [searchTab]);

  useEffect(() => {
    function syncTabFromBrowserHistory() {
      setTab(tabFromSearchParam(new URLSearchParams(window.location.search).get("tab")));
    }
    window.addEventListener("popstate", syncTabFromBrowserHistory);
    return () => window.removeEventListener("popstate", syncTabFromBrowserHistory);
  }, []);

  const sectionFormats = useMemo(() => {
    if (!formats || tab === "mock") return [];
    const activeTab = tabs.find((t) => t.id === tab);
    if (!activeTab?.section) return [];
    return formats
      .filter((f) => f.section === activeTab.section)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [formats, tab, tabs]);

  function selectTab(next: TabId) {
    if (next === tab) return;
    setTab(next);

    const nextUrl = new URL(window.location.href);
    if (next === "listening") {
      nextUrl.searchParams.delete("tab");
    } else {
      nextUrl.searchParams.set("tab", next);
    }
    window.history.pushState(
      window.history.state,
      "",
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`,
    );
  }

  if (!tier) {
    return null;
  }

  const activeTabLabel = tabs.find((item) => item.id === tab)?.label ?? "Nghe";

  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm md:p-8">
        <span
          aria-hidden
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND.purple}26` }}
        />
        <span
          aria-hidden
          className="absolute -bottom-28 right-1/3 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND.cyan}1c` }}
        />
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{ background: GRADIENT_DIAGONAL }}
            >
              <BookOpenCheck size={27} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Kho luyện thi
              </p>
              <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-foreground">
                Luyện thi TOPIK
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Chọn cấp độ và dạng bài phù hợp để luyện tập theo nhịp của riêng bạn.
              </p>
            </div>
          </div>
          <Link
            href="/topik/attempts"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            <History size={16} /> Lịch sử làm bài
          </Link>
        </div>
        <div className="relative mt-7 grid grid-cols-3 gap-3">
          <HeroHint icon={<Headphones size={17} />} label="Luyện theo dạng" text="Nghe, đọc và viết" />
          <HeroHint icon={<FileText size={17} />} label="Chọn số câu" text="Tự điều chỉnh lượt luyện" />
          <HeroHint icon={<Trophy size={17} />} label="Theo dõi tiến bộ" text="Xem lại từng kết quả" />
        </div>
      </section>

      <div className="mt-7 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Bước 1</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">Chọn cấp độ TOPIK</h2>
          </div>
          <p className="text-sm text-muted-foreground">Đang chọn: {topikTierLabel(tier)}</p>
        </div>
        <div className="mt-4 flex gap-3">
        {(["TOPIK_I", "TOPIK_II"] as const).map((t) => {
          const active = tier === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => router.push(`/topik/${t}`)}
              className="relative flex-1 rounded-2xl px-6 py-3 text-sm font-bold"
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
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Bước 2</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">Chọn hình thức luyện</h2>
          </div>
          <p className="text-sm text-muted-foreground">{activeTabLabel}</p>
        </div>
      <div className="mt-4 flex w-fit gap-1 rounded-2xl border border-border bg-secondary/40 p-1">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTab(t.id)}
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

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {error ? (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          ) : null}

          {tab !== "mock" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
            <div className="mt-5">
              {exams === null ? (
                <p className="text-sm text-muted-foreground">Đang tải…</p>
              ) : exams.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có đề thi thử.</p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {exams.map((exam, i) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Link
                        href={`/topik/exams/${exam.id}`}
                        className="group flex h-full items-center gap-4 rounded-3xl border border-border bg-secondary/30 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lg"
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
                          className="rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition-transform group-hover:scale-[1.02]"
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
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}

function HeroHint({
  icon,
  label,
  text,
}: {
  icon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/65 p-3.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
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
