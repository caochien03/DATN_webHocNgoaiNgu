"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Check, GraduationCap } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BRAND, GRADIENT } from "@/components/ui-kit/brand";
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

  async function completeStep(stepId: string) {
    setBusyStepId(stepId);
    setError(null);
    try {
      const res = await fetchWithAuth(`/paths/${id}/steps/${stepId}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        setError(await parseApiError(res));
        return;
      }
      await load();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không cập nhật được bước");
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
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {path.level ?? path.languageCode.toUpperCase()}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">
                {path.title}
              </h1>
              {path.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {path.description}
                </p>
              ) : null}
            </div>
            {!path.progress ? (
              <button
                type="button"
                onClick={() => void startPath()}
                disabled={busyStepId === "__start__"}
                className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: GRADIENT }}
              >
                Bắt đầu
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Tiến độ</span>
              <span className="font-mono">{percent}%</span>
            </div>
            <Bar
              done={path.steps.filter((s) => s.completed).length}
              total={path.steps.length || 1}
              color={BRAND.blue}
            />
          </div>

          <ol className="mt-6 flex flex-col gap-3">
            {path.steps.map((step, i) => {
              const isTopic = step.type === "TOPIC";
              const c = isTopic ? BRAND.blue : BRAND.cyan;
              return (
                <li
                  key={step.id}
                  className="rounded-2xl border border-border bg-card p-4"
                  style={
                    step.completed
                      ? { borderColor: `${BRAND.green}30`, backgroundColor: `${BRAND.green}08` }
                      : undefined
                  }
                >
                  <div className="flex gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                      style={
                        step.completed
                          ? { backgroundColor: BRAND.green, color: "#fff" }
                          : { backgroundColor: `${c}18`, color: c }
                      }
                    >
                      {step.completed ? (
                        <Check size={15} />
                      ) : isTopic ? (
                        <BookOpen size={15} />
                      ) : (
                        <GraduationCap size={15} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {isTopic ? "Chủ đề từ vựng" : "Bài học"}
                      </p>
                      <p className="mt-0.5 font-semibold text-foreground">
                        {step.title}
                      </p>
                      {step.summary ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {step.summary}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {step.topic
                          ? `${step.topic._count.words} từ`
                          : step.lesson
                            ? `${step.lesson._count.vocabulary} từ · ${step.lesson._count.points} ngữ pháp · ${step.lesson._count.exercises} bài tập`
                            : "Nội dung không còn tồn tại"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={stepHref(step)}
                          className="rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Mở nội dung
                        </Link>
                        {!step.completed ? (
                          <button
                            type="button"
                            onClick={() => void completeStep(step.id)}
                            disabled={busyStepId === step.id}
                            className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                            style={{ background: GRADIENT }}
                          >
                            Hoàn thành
                          </button>
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
