"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { useTopic } from "@/lib/use-topic";

function TopicDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { topic, error, loading } = useTopic(id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        href="/topics"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Tất cả chủ đề
      </Link>

      {loading ? <p className="mt-6 text-sm text-zinc-500">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {topic ? (
        <>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {topic.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {topic.languageCode.toUpperCase()}
                {topic.level ? ` · ${topic.level}` : ""} · {topic.words.length}{" "}
                từ
              </p>
              {topic.description ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {topic.description}
                </p>
              ) : null}
            </div>
            <Link
              href={`/topics/${id}/learn`}
              className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Học chủ đề
            </Link>
          </div>

          <section className="mt-8">
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Từ vựng trong chủ đề ({topic.words.length})
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {topic.words.map((w) => (
                <li
                  key={w.id}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {w.frontText}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {w.backText}
                  </p>
                  {w.note ? (
                    <p className="mt-1 text-xs text-zinc-500">{w.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default function TopicDetailPage() {
  return (
    <AuthGate>
      <TopicDetailContent />
    </AuthGate>
  );
}
