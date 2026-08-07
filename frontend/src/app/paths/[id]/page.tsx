"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Check, GraduationCap } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND } from "@/components/ui-kit/brand";
import { Bar } from "@/components/ui-kit/primitives";
import { fetchWithAuth, parseApiError } from "@/lib/api-fetch";
import type { LearningPathDetail, LearningPathStep } from "@/lib/types";

function stepHref(step: LearningPathStep): string {
  if (step.type === "TOPIC" && step.topicId) return `/topics/${step.topicId}`;
  if (step.type === "LESSON" && step.lessonId) return `/lessons/${step.lessonId}`;
  return "#";
}

function PathsDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyStepId, setBusyStepId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/paths/${id}`);
      if (res.status === 404) {
        setError("Không tìm thấy lộ trình.");
        return;
      }
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      setPath((await res.json()) as LearningPathDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được lộ trình");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const percent = useMemo(() => {
    if (!path || path.steps.length === 0) return 0;
    const completed = path.steps.filter((s) => s.completed).length;
    return Math.round((completed / path.steps.length) * 100);
  }, [path]);

  async function startPath() {
    setBusyStepId("__start__");
    setError(null);
    try {
      const res = await fetchWithAuth(`/paths/${id}/start`, { method: "POST" });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không bắt đầu được lộ trình");
    } finally {
      setBusyStepId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/paths"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Tất cả lộ trình
      </Link>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {path ? (
        <>
          {/* Header card với gradient */}
          <div
            className="relative mt-5 overflow-hidden rounded-2xl p-6"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue}18 0%, ${BRAND.cyan}10 100%)`,
              border: `1px solid ${BRAND.blue}25`,
              boxShadow: `0 4px 24px 0 ${BRAND.blue}15`,
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
              style={{ background: `${BRAND.cyan}20` }}
            />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: `${BRAND.blue}20`, color: BRAND.blue }}
                >
                  {path.level ?? path.languageCode.toUpperCase()}
                </span>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
                  {path.title}
                </h1>
                {path.description ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {path.description}
                  </p>
                ) : null}
              </div>
              {!path.progress ? (
                <button
                  type="button"
                  onClick={() => void startPath()}
                  disabled={busyStepId === "__start__"}
                  className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})`,
                    boxShadow: `0 4px 14px 0 ${BRAND.blue}40`,
                  }}
                >
                  Bắt đầu
                </button>
              ) : null}
            </div>

            {/* Progress bar */}
            <div className="relative mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Tiến độ</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{ background: `${BRAND.green}20`, color: BRAND.green }}
                >
                  {percent}%
                </span>
              </div>
              <Bar
                done={path.steps.filter((s) => s.completed).length}
                total={path.steps.length || 1}
                color={BRAND.blue}
              />
            </div>
          </div>

          {/* Step list */}
          <ol className="mt-5 flex flex-col gap-3">
            {path.steps.map((step) => {
              const isTopic = step.type === "TOPIC";
              const c = isTopic ? BRAND.blue : BRAND.cyan;
              return (
                <li
                  key={step.id}
                  className="relative overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-200"
                  style={{
                    borderColor: step.completed ? `${BRAND.green}40` : `${c}25`,
                    boxShadow: step.completed
                      ? `0 2px 12px 0 ${BRAND.green}15`
                      : `0 2px 8px 0 ${c}10`,
                  }}
                >
                  {/* Left color bar */}
                  <div
                    className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
                    style={{ background: step.completed ? BRAND.green : c }}
                  />
                  <div className="flex gap-3 pl-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                      style={{
                        background: step.completed
                          ? `linear-gradient(135deg, ${BRAND.green}, #16a34a)`
                          : `linear-gradient(135deg, ${c}25, ${c}15)`,
                        color: step.completed ? "#fff" : c,
                        boxShadow: step.completed ? `0 2px 8px 0 ${BRAND.green}40` : "none",
                      }}
                    >
                      {step.completed ? (
                        <Check size={16} />
                      ) : isTopic ? (
                        <BookOpen size={15} />
                      ) : (
                        <GraduationCap size={15} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: `${c}18`, color: c }}
                      >
                        {isTopic ? "Chủ đề từ vựng" : "Bài học"}
                      </span>
                      <p className="mt-1 font-bold text-foreground">{step.title}</p>
                      {step.summary ? (
                        <p className="mt-0.5 text-sm text-muted-foreground">{step.summary}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {step.topic
                          ? `${step.topic._count.words} từ • Yêu cầu: Đạt ≥ 80% Trắc nghiệm hoặc Luyện viết`
                          : step.lesson
                            ? `${step.lesson._count.vocabulary} từ · ${step.lesson._count.points} ngữ pháp · ${step.lesson._count.exercises} bài tập • Yêu cầu: Đạt ≥ 80% cả Từ vựng & Ngữ pháp`
                            : "Nội dung không còn tồn tại"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={stepHref(step)}
                          className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                          style={{
                            background: step.completed
                              ? "var(--secondary)"
                              : `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
                            color: step.completed ? "var(--foreground)" : "#fff",
                            border: step.completed ? "1px solid var(--border)" : "none",
                          }}
                        >
                          {step.completed ? "Xem lại nội dung →" : "Vào học & làm bài →"}
                        </Link>
                        {step.completed ? (
                          <span
                            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold"
                            style={{ background: `${BRAND.green}15`, color: BRAND.green }}
                          >
                            <Check size={12} /> Đã hoàn thành (≥ 80%)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      ) : !error ? (
        <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p>
      ) : null}
    </div>
  );
}

export default function PathDetailPage() {
  return (
    <AuthGate>
      <PathsDetailContent />
    </AuthGate>
  );
}
