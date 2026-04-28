"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
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
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        href="/paths"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Tất cả lộ trình
      </Link>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {path ? (
        <>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                {path.level ?? path.languageCode.toUpperCase()}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {path.title}
              </h1>
              {path.description ? (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {path.description}
                </p>
              ) : null}
            </div>
            {!path.progress ? (
              <button
                type="button"
                onClick={() => void startPath()}
                disabled={busyStepId === "__start__"}
                className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Bắt đầu
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Tiến độ</span>
              <span>{percent}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <ol className="mt-6 flex flex-col gap-3">
            {path.steps.map((step, i) => (
              <li
                key={step.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                      step.completed
                        ? "bg-green-600 text-white"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {step.completed ? "✓" : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {step.type === "TOPIC" ? "Chủ đề từ vựng" : "Bài học"}
                    </p>
                    <p className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {step.title}
                    </p>
                    {step.summary ? (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {step.summary}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-zinc-500">
                      {step.topic
                        ? `${step.topic._count.words} từ`
                        : step.lesson
                          ? `${step.lesson._count.vocabulary} từ · ${step.lesson._count.points} ngữ pháp · ${step.lesson._count.exercises} bài tập`
                          : "Nội dung không còn tồn tại"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={stepHref(step)}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        Mở nội dung
                      </Link>
                      {!step.completed ? (
                        <button
                          type="button"
                          onClick={() => void completeStep(step.id)}
                          disabled={busyStepId === step.id}
                          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                        >
                          Hoàn thành
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : !error ? (
        <p className="mt-6 text-sm text-zinc-500">Đang tải…</p>
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
