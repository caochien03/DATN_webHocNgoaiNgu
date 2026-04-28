"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth, parseApiError } from "./api-fetch";
import type { LessonDetail } from "./types";

type State = {
  lesson: LessonDetail | null;
  error: string | null;
  loading: boolean;
};

export function useLesson(id: string | undefined) {
  const [state, setState] = useState<State>({
    lesson: null,
    error: null,
    loading: true,
  });

  const reload = useCallback(async () => {
    if (!id) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchWithAuth(`/lessons/${id}`);
      if (res.status === 404) {
        setState({
          lesson: null,
          error: "Không tìm thấy bài học.",
          loading: false,
        });
        return;
      }
      if (!res.ok) {
        setState({
          lesson: null,
          error: await parseApiError(res),
          loading: false,
        });
        return;
      }
      setState({
        lesson: (await res.json()) as LessonDetail,
        error: null,
        loading: false,
      });
    } catch (e) {
      setState({
        lesson: null,
        error: e instanceof Error ? e.message : "Không tải được bài học",
        loading: false,
      });
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}
