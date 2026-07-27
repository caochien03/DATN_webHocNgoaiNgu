"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpenCheck, Clock, FileText, Headphones, History, Trophy } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { ToeicFormatCard } from "@/components/toeic/ToeicFormatCard";
import { BRAND, GRADIENT, GRADIENT_DIAGONAL } from "@/components/ui-kit/brand";
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

function tabFromSearchParam(value: string | null): TabId {
  if (value === "reading" || value === "mock") return value;
  return "listening";
}

function ToeicHubContent() {
  const searchParams = useSearchParams();
  const searchTab = tabFromSearchParam(searchParams.get("tab"));
  const [tab, setTab] = useState<TabId>(searchTab);

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
    const activeTab = TABS.find((t) => t.id === tab);
    if (!activeTab?.section) return [];
    return formats
      .filter((f) => f.section === activeTab.section)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [formats, tab]);

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

  const activeTabLabel = TABS.find((item) => item.id === tab)?.label ?? "Nghe";

  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm md:p-8">
        <span
          aria-hidden
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND.blue}24` }}
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
                Luyện thi TOEIC
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Luyện theo từng Part, kiểm soát số câu mỗi lượt và theo dõi tiến bộ của bạn.
              </p>
            </div>
          </div>
          <Link
            href="/toeic/attempts"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            <History size={16} /> Lịch sử làm bài
          </Link>
        </div>
        <div className="relative mt-7 grid grid-cols-3 gap-3">
          <HubHint icon={<Headphones size={17} />} label="Luyện theo Part" text="Nghe và đọc" />
          <HubHint icon={<FileText size={17} />} label="Chọn số câu" text="Tự điều chỉnh lượt luyện" />
          <HubHint icon={<Trophy size={17} />} label="Theo dõi tiến bộ" text="Xem lại từng kết quả" />
        </div>
      </section>

      <div className="mt-7 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Chọn hình thức luyện</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{toeicTierLabel(TIER)}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{activeTabLabel}</p>
        </div>
      <div className="mt-4 flex w-fit gap-1 rounded-2xl border border-border bg-secondary/40 p-1">
        {TABS.map((t) => {
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
                        href={`/toeic/exams/${exam.id}`}
                        className="group flex h-full items-center gap-4 rounded-3xl border border-border bg-secondary/30 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lg"
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

function HubHint({
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

export default function ToeicHubPage() {
  return (
    <AuthGate>
      <ToeicHubContent />
    </AuthGate>
  );
}
