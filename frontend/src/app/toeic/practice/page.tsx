"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CirclePlay, Hash, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { TopikQuizRunner } from "@/components/topik/TopikQuizRunner";
import { GRADIENT } from "@/components/ui-kit/brand";
import { inputClass } from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import { toeicSectionLabel } from "@/lib/toeic-labels";
import type {
  ExamMcqSubmitResult,
  ToeicQuestion,
  ToeicSection,
  ToeicTier,
} from "@/lib/types";

const COUNT_PRESETS = [5, 10, 15, 20, 30] as const;
const DEFAULT_COUNT = 10;

function PracticeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tier = (params.get("tier") ?? "TOEIC_LR") as ToeicTier;
  const section = params.get("section") as ToeicSection | null;
  const fromNo = params.get("fromNo");
  const toNo = params.get("toNo");
  const countParam = params.get("count");

  const [formatTitle, setFormatTitle] = useState("");
  const [selectedCount, setSelectedCount] = useState(
    countParam ? parseInt(countParam, 10) || DEFAULT_COUNT : DEFAULT_COUNT,
  );
  const [questions, setQuestions] = useState<ToeicQuestion[] | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [requestedCount, setRequestedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatRangeSize = useMemo(() => {
    if (!fromNo || !toNo) return null;
    return parseInt(toNo, 10) - parseInt(fromNo, 10) + 1;
  }, [fromNo, toNo]);

  const countOptions = useMemo(() => {
    const set = new Set<number>(COUNT_PRESETS);
    if (formatRangeSize && formatRangeSize > 0) set.add(formatRangeSize);
    if (selectedCount > 0) set.add(selectedCount);
    return [...set].sort((a, b) => a - b);
  }, [formatRangeSize, selectedCount]);

  useEffect(() => {
    if (!section || !fromNo || !toNo) return;
    void (async () => {
      try {
        const fmtRes = await fetchWithAuth(
          `/toeic/formats?tier=${tier}&section=${section}`,
        );
        if (!fmtRes.ok) return;
        const formats = (await fmtRes.json()) as {
          fromNo: number;
          toNo: number;
          title: string;
          part: number;
        }[];
        const match = formats.find(
          (f) =>
            f.fromNo === parseInt(fromNo, 10) &&
            f.toNo === parseInt(toNo, 10),
        );
        if (match) setFormatTitle(`Part ${match.part} · ${match.title}`);
      } catch {
        /* ignore */
      }
    })();
  }, [tier, section, fromNo, toNo]);

  const startPractice = useCallback(async () => {
    if (!section || !fromNo || !toNo) {
      setError(
        "Không xác định được Part cần luyện. Vui lòng quay lại trang TOEIC và chọn một Part.",
      );
      return;
    }
    const count = Math.min(50, Math.max(1, selectedCount));
    setLoading(true);
    setError(null);
    setQuestions(null);
    try {
      const q = new URLSearchParams({
        tier,
        section,
        fromNo,
        toNo,
        count: String(count),
      });
      const res = await fetchWithAuth(`/toeic/practice?${q}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const data = (await res.json()) as {
        questions: ToeicQuestion[];
        count: number;
        requestedCount: number;
      };
      if (data.questions.length === 0) {
        setError("Không lấy được câu hỏi cho lượt luyện này.");
        return;
      }
      setQuestions(data.questions);
      setActiveCount(data.count);
      setRequestedCount(data.requestedCount);
      const next = new URLSearchParams(params.toString());
      next.set("count", String(count));
      router.replace(`/toeic/practice?${next.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [tier, section, fromNo, toNo, selectedCount, params, router]);

  useEffect(() => {
    if (!countParam) return;
    const n = parseInt(countParam, 10);
    if (n >= 1 && n <= 50) setSelectedCount(n);
  }, [countParam]);

  async function submit(
    answers: { questionId: string; selectedIndex: number }[],
  ): Promise<ExamMcqSubmitResult> {
    const res = await fetchWithAuth("/toeic/practice/submit", {
      method: "POST",
      body: JSON.stringify({
        tier,
        section,
        fromNo: parseInt(fromNo!, 10),
        toNo: parseInt(toNo!, 10),
        answers,
      }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    return (await res.json()) as ExamMcqSubmitResult;
  }

  function backToSetup() {
    setQuestions(null);
    setActiveCount(null);
    setRequestedCount(null);
  }

  if (!section || !fromNo || !toNo) {
    return <p className="text-sm text-red-400">Thiếu tham số Part.</p>;
  }

  const rangeLabel = fromNo === toNo ? fromNo : `${fromNo}–${toNo}`;
  const subtitle = `${toeicSectionLabel(section)} · câu ${rangeLabel}${formatTitle ? ` · ${formatTitle}` : ""}`;

  if (questions && activeCount !== null) {
    return (
      <div className="mx-auto max-w-3xl">
        {requestedCount !== null && activeCount < requestedCount ? (
          <p className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Pool đề đã công bố chỉ có {activeCount} câu cho Part này (bạn chọn{" "}
            {requestedCount}).
          </p>
        ) : null}
        <TopikQuizRunner
          title="Luyện Part"
          subtitle={`${subtitle} · ${activeCount} câu`}
          questions={questions}
          backHref={`/toeic/${tier}`}
          attemptsBasePath="/toeic/attempts"
          onSubmit={submit}
        />
        <button
          type="button"
          onClick={backToSetup}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Chọn lại số câu
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/toeic/${tier}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> Quay lại kho luyện TOEIC
      </Link>
      <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <span aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: GRADIENT }}>
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Thiết lập lượt luyện</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Luyện Part TOEIC</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </section>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <div className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Hash size={17} /></span>
          <div>
            <p className="text-base font-bold text-foreground">Số câu mỗi lượt</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Chọn số câu phù hợp với thời gian học hiện có của bạn.</p>
          </div>
        </div>
        <label className="block text-sm font-medium text-muted-foreground">
          Số lượng câu hỏi
        </label>
        <select
          value={selectedCount}
          onChange={(e) => setSelectedCount(parseInt(e.target.value, 10))}
          className={inputClass}
        >
          {countOptions.map((n) => (
            <option key={n} value={n}>
              {n} câu
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={loading}
          onClick={() => void startPractice()}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: GRADIENT }}
        >
          <CirclePlay size={17} /> {loading ? "Đang tải câu…" : "Bắt đầu luyện"}
        </button>
      </div>
    </div>
  );
}

export default function ToeicPracticePage() {
  return (
    <AuthGate>
      <PracticeContent />
    </AuthGate>
  );
}
