"use client";

import { useCallback, useEffect } from "react";
import type { WritingAnswerState } from "@/lib/topik-answers";

const LEAVE_MSG =
  "Bạn đang làm dở bài. Rời trang sẽ mất câu trả lời chưa nộp. Bạn có chắc muốn thoát?";

export function hasMcqSelections(selections: Record<string, number>): boolean {
  return Object.keys(selections).length > 0;
}

export function hasWritingDraft(writing: WritingAnswerState): boolean {
  return Object.values(writing).some((val) => {
    if (Array.isArray(val)) return val.some((t) => t.trim().length > 0);
    return typeof val === "string" && val.trim().length > 0;
  });
}

export function hasSessionProgress(
  mcq: Record<string, number>,
  writing: WritingAnswerState = {},
): boolean {
  return hasMcqSelections(mcq) || hasWritingDraft(writing);
}

/** Cảnh báo đóng tab + confirm khi bấm Quay lại. */
export function useTopikLeaveGuard(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled]);

  const confirmLeave = useCallback(() => {
    if (!enabled) return true;
    return window.confirm(LEAVE_MSG);
  }, [enabled]);

  return { confirmLeave };
}
