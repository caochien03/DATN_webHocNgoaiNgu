"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopikQuizRunner } from "@/components/topik/TopikQuizRunner";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
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
      return "Không kết nối được API. Kiểm tra backend (port 4000) và Postgres đã chạy, rồi chạy prisma migrate deploy.";
    }
    return e.message;
  }
  return "Không tải được câu hỏi";
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

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
      setError("Thiếu tham số dạng bài.");
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
    answers: { questionId: string; selectedIndex: number }[],
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
      <p className="px-4 py-8 text-sm text-red-600">Thiếu tham số dạng bài.</p>
    );
  }

  const rangeLabel =
    fromNo === toNo ? fromNo : `${fromNo}–${toNo}`;
  const subtitle = `${topikSectionLabel(section)} · câu ${rangeLabel}${formatTitle ? ` · ${formatTitle}` : ""}`;

  if (questions && activeCount !== null) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {requestedCount !== null && activeCount < requestedCount ? (
          <p className="mb-4 text-sm text-amber-800 dark:text-amber-300">
            Pool đề đã công bố chỉ có {activeCount} câu cho dạng này (bạn chọn{" "}
            {requestedCount}).
          </p>
        ) : null}
        <TopikQuizRunner
          title="Luyện dạng bài"
          subtitle={`${subtitle} · ${activeCount} câu`}
          questions={questions}
          backHref={`/topik/${tier}`}
          onSubmit={submit}
        />
        <button
          type="button"
          onClick={backToSetup}
          className="mt-4 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          ← Chọn lại số câu
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href={`/topik/${tier}`}
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Quay lại
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Luyện dạng bài
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {subtitle}
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Số câu muốn làm
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Random {selectedCount} câu khác nhau từ các đề đã công bố (dạng câu{" "}
          {rangeLabel}
          {formatRangeSize
            ? ` · mỗi đề thật có ${formatRangeSize} vị trí số câu trong dạng này`
            : null}
          ).
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {countOptions.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelectedCount(n)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedCount === n
                  ? "bg-orange-500 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {n} câu
            </button>
          ))}
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span>Hoặc nhập số câu (1–50)</span>
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
          className="mt-4 w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "Đang tải câu…" : "Bắt đầu luyện"}
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
