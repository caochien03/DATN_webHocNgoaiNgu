"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CirclePlay, Hash, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { TopikQuizRunner } from "@/components/topik/TopikQuizRunner";
import { TopikWritingRunner } from "@/components/topik/TopikWritingRunner";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
import { inputClass } from "@/components/ui-kit/form-styles";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { TopikAnswerPayload } from "@/lib/topik-answers";
import { topikSectionLabel } from "@/lib/topik-labels";
import type {
  TopikQuestion,
  TopikSection,
  TopikSubmitResult,
  TopikTier,
} from "@/lib/types";

const COUNT_PRESETS = [5, 10, 15, 20, 30] as const;
const DEFAULT_COUNT = 10;

function formatLoadError(e: unknown): string {
  if (e instanceof Error) {
    if (e.message === "Failed to fetch") {
      return "Không thể kết nối đến hệ thống. Vui lòng kiểm tra kết nối và thử lại.";
    }
    return e.message;
  }
  return "Không tải được câu hỏi";
}

function PracticeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tier = (params.get("tier") ?? "TOPIK_I") as TopikTier;
  const section = params.get("section") as TopikSection | null;
  const fromNo = params.get("fromNo");
  const toNo = params.get("toNo");
  const countParam = params.get("count");

  const [formatTitle, setFormatTitle] = useState("");
  const [selectedCount, setSelectedCount] = useState(
    countParam ? parseInt(countParam, 10) || DEFAULT_COUNT : DEFAULT_COUNT,
  );
  const [questions, setQuestions] = useState<TopikQuestion[] | null>(null);
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
          `/topik/formats?tier=${tier}&section=${section}`,
        );
        if (!fmtRes.ok) return;
        const formats = (await fmtRes.json()) as {
          fromNo: number;
          toNo: number;
          title: string;
        }[];
        const match = formats.find(
          (f) =>
            f.fromNo === parseInt(fromNo, 10) &&
            f.toNo === parseInt(toNo, 10),
        );
        if (match) setFormatTitle(match.title);
      } catch {
        /* ignore */
      }
    })();
  }, [tier, section, fromNo, toNo]);

  const startPractice = useCallback(async () => {
    if (!section || !fromNo || !toNo) {
      setError(
        "Không xác định được dạng bài. Vui lòng quay lại trang TOPIK và chọn một dạng luyện tập.",
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
      const res = await fetchWithAuth(`/topik/practice?${q}`);
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      const data = (await res.json()) as {
        questions: TopikQuestion[];
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
      router.replace(`/topik/practice?${next.toString()}`);
    } catch (e) {
      setError(formatLoadError(e));
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
    answers: TopikAnswerPayload[],
  ): Promise<TopikSubmitResult> {
    const res = await fetchWithAuth("/topik/practice/submit", {
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
    return (await res.json()) as TopikSubmitResult;
  }

  function backToSetup() {
    setQuestions(null);
    setActiveCount(null);
    setRequestedCount(null);
  }

  if (!section || !fromNo || !toNo) {
    return (
      <p className="text-sm text-red-400">Thiếu tham số dạng bài.</p>
    );
  }

  const rangeLabel =
    fromNo === toNo ? fromNo : `${fromNo}–${toNo}`;
  const subtitle = `${topikSectionLabel(section)} · câu ${rangeLabel}${formatTitle ? ` · ${formatTitle}` : ""}`;

  const isWriting = section === "WRITING";

  if (questions && activeCount !== null) {
    const Runner = isWriting ? TopikWritingRunner : TopikQuizRunner;
    return (
      <div className="mx-auto max-w-3xl">
        {requestedCount !== null && activeCount < requestedCount ? (
          <p className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Pool đề đã công bố chỉ có {activeCount} câu cho dạng này (bạn chọn{" "}
            {requestedCount}).
          </p>
        ) : null}
        <Runner
          title="Luyện dạng bài"
          subtitle={`${subtitle} · ${activeCount} câu`}
          questions={questions}
          backHref={`/topik/${tier}`}
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
        href={`/topik/${tier}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> Quay lại kho luyện TOPIK
      </Link>
      <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <span
          aria-hidden
          className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: GRADIENT }}>
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Thiết lập lượt luyện</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Luyện dạng bài</h1>
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
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Hash size={17} /></span>
          <div>
            <p className="text-base font-bold text-foreground">Số câu muốn làm</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Hệ thống chọn ngẫu nhiên {selectedCount} câu từ các đề đã công bố (dạng câu{" "}
          {rangeLabel}
          {formatRangeSize
            ? ` · mỗi đề thật có ${formatRangeSize} vị trí số câu trong dạng này`
            : null}
          ).
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {countOptions.map((n) => {
            const active = selectedCount === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedCount(n)}
                className="rounded-2xl px-4 py-2 text-sm font-bold transition-colors"
                style={
                  active
                    ? { background: GRADIENT, color: "#fff" }
                    : {
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: BRAND.muted,
                      }
                }
              >
                {n} câu
              </button>
            );
          })}
        </div>

        <label className="mt-4 flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-muted-foreground">Hoặc nhập số câu (1–50)</span>
          <input
            type="number"
            min={1}
            max={50}
            value={selectedCount}
            onChange={(e) =>
              setSelectedCount(parseInt(e.target.value, 10) || DEFAULT_COUNT)
            }
            className={inputClass}
          />
        </label>

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

export default function TopikPracticePage() {
  return (
    <AuthGate>
      <PracticeContent />
    </AuthGate>
  );
}
