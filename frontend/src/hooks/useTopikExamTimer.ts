"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function formatExamTimeRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function useTopikExamTimer(
  durationMinutes: number | null | undefined,
  onExpire: () => void,
  paused = false,
) {
  const totalMs =
    durationMinutes != null && durationMinutes > 0
      ? durationMinutes * 60 * 1000
      : null;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const markExpired = useCallback(() => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    onExpireRef.current();
  }, []);

  useEffect(() => {
    expiredRef.current = false;
    setRemainingMs(totalMs);
  }, [totalMs]);

  useEffect(() => {
    if (remainingMs == null || paused || expiredRef.current) return;
    if (remainingMs <= 0) {
      markExpired();
      return;
    }
    const id = window.setInterval(() => {
      setRemainingMs((prev) => {
        if (prev == null) return prev;
        const next = prev - 1000;
        if (next <= 0) {
          window.clearInterval(id);
          markExpired();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [remainingMs, paused, markExpired]);

  const isLow = remainingMs != null && remainingMs > 0 && remainingMs <= 5 * 60 * 1000;

  return {
    remainingMs,
    label: remainingMs != null ? formatExamTimeRemaining(remainingMs) : null,
    isLow,
    hasTimer: remainingMs != null,
  };
}
