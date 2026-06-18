"use client";

import { useEffect, useState } from "react";

type WritingSubmitOverlayProps = {
  visible: boolean;
  hasWriting: boolean;
  writingCount?: number;
};

export function WritingSubmitOverlay({
  visible,
  hasWriting,
  writingCount = 1,
}: WritingSubmitOverlayProps) {
  const [phase, setPhase] = useState<"submit" | "grade">("submit");

  useEffect(() => {
    if (!visible) {
      setPhase("submit");
      return;
    }
    if (!hasWriting) return;
    const id = window.setTimeout(() => setPhase("grade"), 600);
    return () => window.clearTimeout(id);
  }, [visible, hasWriting]);

  if (!visible) return null;

  const title =
    hasWriting && phase === "grade"
      ? "Đang chấm bài viết bằng AI…"
      : "Đang nộp bài…";

  const detail = hasWriting
    ? phase === "grade"
      ? `Gemini đang đánh giá ${writingCount} câu viết. Câu luận dài có thể mất 10–20 giây.`
      : "Đang gửi câu trả lời lên máy chủ…"
    : "Vui lòng đợi trong giây lát.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex items-start gap-4">
          <Spinner />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{detail}</p>
            {hasWriting ? (
              <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                <Step done={phase !== "submit"} label="Gửi bài" />
                <Step
                  done={false}
                  active={phase === "grade"}
                  label="Chấm điểm & nhận xét AI"
                />
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      className="mt-0.5 h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-zinc-200 border-t-orange-500 dark:border-zinc-700 dark:border-t-orange-400"
      aria-hidden
    />
  );
}

function Step({
  label,
  done,
  active = false,
}: {
  label: string;
  done: boolean;
  active?: boolean;
}) {
  return (
    <li
      className={
        done
          ? "text-emerald-600 dark:text-emerald-400"
          : active
            ? "font-medium text-zinc-800 dark:text-zinc-200"
            : "text-zinc-400"
      }
    >
      {done ? "✓" : active ? "…" : "○"} {label}
    </li>
  );
}
