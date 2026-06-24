"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Play } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { GRADIENT } from "@/components/ui-kit/brand";
import { useTopic } from "@/lib/use-topic";

function TopicDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { topic, error, loading } = useTopic(id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/topics"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Tất cả chủ đề
      </Link>

      {loading ? <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {topic ? (
        <>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {topic.languageCode.toUpperCase()}
                {topic.level ? ` · ${topic.level}` : ""} · {topic.words.length} từ
              </p>
              {topic.description ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {topic.description}
                </p>
              ) : null}
            </div>
            <Link
              href={`/topics/${id}/learn`}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: GRADIENT }}
            >
              <Play size={14} /> Học chủ đề
            </Link>
          </div>

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Từ vựng trong chủ đề ({topic.words.length})
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {topic.words.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
                >
                  <p className="font-semibold text-foreground">{w.frontText}</p>
                  <p className="text-muted-foreground">{w.backText}</p>
                  {w.note ? (
                    <p className="mt-1 text-xs text-muted-foreground/70">{w.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
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
