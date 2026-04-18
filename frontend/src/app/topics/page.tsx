"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { TopicRow } from "@/lib/types";

const LANG_LABEL: Record<string, string> = {
  ko: "Tiếng Hàn",
  en: "Tiếng Anh",
  vi: "Tiếng Việt",
};

function TopicsContent() {
  const [topics, setTopics] = useState<TopicRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/topics?language=ko");
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setTopics((await res.json()) as TopicRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được chủ đề");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Chủ đề từ vựng
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Chọn chủ đề để xem từ vựng và bắt đầu học. Bạn có thể sao chép vào bộ
        cá nhân để ghi nhận tiến độ.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {topics === null ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
      ) : topics.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          Chưa có chủ đề nào. Hãy chạy seed lại ở backend.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {topics.map((t) => (
            <li key={t.id}>
              <Link
                href={`/topics/${t.id}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {t.title}
                  </p>
                  {t.description ? (
                    <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {t.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-500">
                    {LANG_LABEL[t.languageCode] ?? t.languageCode}
                    {t.level ? ` · ${t.level}` : ""} · {t._count.words} từ
                  </p>
                </div>
                <span className="self-center text-zinc-400">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TopicsPage() {
  return (
    <AuthGate>
      <TopicsContent />
    </AuthGate>
  );
}
