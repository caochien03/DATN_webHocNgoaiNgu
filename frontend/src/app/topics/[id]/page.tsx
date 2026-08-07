"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, Play, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, GRADIENT_DIAGONAL, levelColor } from "@/components/ui-kit/brand";
import { Tag } from "@/components/ui-kit/primitives";
import { PathStepStatusCard } from "@/components/paths/PathStepStatusCard";
import { useTopic } from "@/lib/use-topic";

function TopicDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { topic, error, loading } = useTopic(id);

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <Link
        href="/topics"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
          <section className="relative mt-5 overflow-hidden rounded-[28px] border border-primary/15 bg-card p-7 shadow-[0_18px_50px_-34px_rgba(249,115,22,0.75)]">
            <div
              className="absolute inset-0 opacity-100"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.13), transparent 55%, rgba(251,191,36,0.13))" }}
            />
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-8">
              <div className="flex min-w-0 items-start gap-5">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/25"
                  style={{ background: GRADIENT_DIAGONAL }}
                >
                  <BookOpen size={27} />
                </div>
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Tag color={BRAND.blue}>{topic.languageCode.toUpperCase()}</Tag>
                    {topic.level ? <Tag color={levelColor(topic.level)}>{topic.level}</Tag> : null}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {topic.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {topic.description || "Khám phá từ vựng theo chủ đề và luyện tập theo cách phù hợp với bạn."}
                  </p>
                </div>
              </div>
              <Link
                href={`/topics/${id}/learn`}
                className="relative flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                style={{ background: GRADIENT_DIAGONAL }}
              >
                <Play size={16} fill="currentColor" /> Bắt đầu học
              </Link>
            </div>

            <div className="relative mt-7 grid max-w-xl grid-cols-2 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-background/55">
              <div className="px-5 py-3.5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Từ vựng
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">{topic.words.length}</p>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Hình thức học
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Sparkles size={15} style={{ color: BRAND.yellow }} /> 4 chế độ
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Danh sách từ</p>
                <h2 className="mt-1 text-xl font-bold text-foreground">Từ vựng trong chủ đề</h2>
              </div>
              <p className="text-sm text-muted-foreground">{topic.words.length} từ</p>
            </div>
            {topic.words.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                Chủ đề này chưa có từ vựng.
              </div>
            ) : (
            <div className="grid grid-cols-2 gap-3">
                {topic.words.map((w, index) => {
                  const hue = index % 5;
                  const colors = [
                    BRAND.blue, BRAND.cyan, BRAND.green, BRAND.purple, BRAND.red,
                  ] as const;
                  const c = colors[hue];
                  return (
                  <div
                    key={w.id}
                    className="group flex gap-3 rounded-2xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      borderColor: `${c}20`,
                      boxShadow: "var(--shadow-card)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = `${c}50`;
                      (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-card-hover)`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = `${c}20`;
                      (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-card)`;
                    }}
                  >
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold text-white"
                      style={{ background: `linear-gradient(135deg, ${c}, ${c}80)` }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">{w.frontText}</p>
                      <p className="mt-0.5 text-sm" style={{ color: c }}>{w.backText}</p>
                      {w.note ? (
                        <p
                          className="mt-1.5 rounded-lg px-2 py-1 text-xs leading-5 text-muted-foreground"
                          style={{ background: `${c}10` }}
                        >
                          {w.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </section>

          <PathStepStatusCard sourceType="TOPIC" sourceId={topic.id} />
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
