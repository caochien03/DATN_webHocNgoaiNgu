"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth, parseApiError } from "./api-fetch";
import type { DeckDetail } from "./types";

type State = {
  deck: DeckDetail | null;
  error: string | null;
  loading: boolean;
};

export function useDeck(id: string | undefined) {
  const [state, setState] = useState<State>({
    deck: null,
    error: null,
    loading: true,
  });

  const reload = useCallback(async () => {
    if (!id) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchWithAuth(`/decks/${id}`);
      if (res.status === 404) {
        setState({ deck: null, error: "Không tìm thấy bộ.", loading: false });
        return;
      }
      if (!res.ok) {
        setState({
          deck: null,
          error: await parseApiError(res),
          loading: false,
        });
        return;
      }
      const deck = (await res.json()) as DeckDetail;
      setState({ deck, error: null, loading: false });
    } catch (e) {
      setState({
        deck: null,
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
