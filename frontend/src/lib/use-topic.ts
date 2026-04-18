"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth, parseApiError } from "./api-fetch";
import type { TopicDetail } from "./types";

type State = {
  topic: TopicDetail | null;
  error: string | null;
  loading: boolean;
};

export function useTopic(id: string | undefined) {
  const [state, setState] = useState<State>({
    topic: null,
    error: null,
    loading: true,
  });

  const reload = useCallback(async () => {
    if (!id) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchWithAuth(`/topics/${id}`);
      if (res.status === 404) {
        setState({
          topic: null,
          error: "Không tìm thấy chủ đề.",
          loading: false,
        });
        return;
      }
      if (!res.ok) {
        setState({
          topic: null,
          error: await parseApiError(res),
          loading: false,
        });
        return;
      }
      const topic = (await res.json()) as TopicDetail;
      setState({ topic, error: null, loading: false });
    } catch (e) {
      setState({
        topic: null,
        error: e instanceof Error ? e.message : "Không tải được",
        loading: false,
      });
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}
