"use client";

import Link from "next/link";
import { useState } from "react";
import type { GradedTopikAnswer, TopikQuestion, TopikSubmitResult } from "@/lib/types";
import { topikSectionLabel } from "@/lib/topik-labels";

type TopikQuizRunnerProps = {
  title: string;
  subtitle?: string;
  questions: TopikQuestion[];
  backHref: string;
  onSubmit: (
    answers: { questionId: string; selectedIndex: number }[],
  ) => Promise<TopikSubmitResult>;
};

export function TopikQuizRunner({
  title,
  subtitle,
  questions,
  backHref,
  onSubmit,
}: TopikQuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopikSubmitResult | null>(null);

  const current = questions[index] ?? null;
  const allAnswered = questions.every((q) => selections[q.id] !== undefined);

  function pick(optionIndex: number) {
    if (!current || result) return;
    setSelections((prev) => ({ ...prev, [current.id]: optionIndex }));
  }

  async function finish() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: selections[q.id]!,
      }));
      setResult(await onSubmit(answers));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không nộp được bài");
    } finally {
      setSubmitting(false);
    }
  }

  if (questions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Chưa có câu hỏi. Quay lại và chọn dạng khác.
      </p>
    );
  }

  if (result) {
    return (
      <ResultView
        result={result}
        questions={questions}
        backHref={backHref}
        attemptHref={`/topik/attempts/${result.attemptId}`}
      />
    );
  }

  return (
    <div>
      <Link
        href={backHref}
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Quay lại
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {current ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500">
            Câu {index + 1}/{questions.length} ·{" "}
            {topikSectionLabel(current.section)} #{current.questionNo}
          </p>
          {current.passage ? (
            <p className="mt-3 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {current.passage}
            </p>
          ) : null}
          {current.audioUrl ? (
            <audio className="mt-3 w-full" controls src={current.audioUrl}>
              <track kind="captions" />
            </audio>
          ) : null}
          <h2 className="mt-3 text-base font-medium text-zinc-900 dark:text-zinc-100">
            {current.prompt}
          </h2>
          <div className="mt-4 grid gap-2">
            {current.options.map((opt, i) => {
              const selected = selections[current.id] === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                    selected
                      ? "border-zinc-900 bg-zinc-100 dark:border-zinc-300 dark:bg-zinc-800"
                      : "border-zinc-300 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  }`}
                >
                  {i + 1}. {opt}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((x) => x - 1)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              Câu trước
            </button>
            {index + 1 < questions.length ? (
              <button
                type="button"
                disabled={selections[current.id] === undefined}
                onClick={() => setIndex((x) => x + 1)}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Câu sau
              </button>
            ) : (
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={() => void finish()}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {submitting ? "Đang nộp…" : "Nộp bài"}
              </button>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ResultView({
  result,
  questions,
  backHref,
  attemptHref,
}: {
  result: TopikSubmitResult;
  questions: TopikQuestion[];
  backHref: string;
  attemptHref: string;
}) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const graded = result.answers as GradedTopikAnswer[];

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Kết quả
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Đúng{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {result.correctCount}/{result.totalQuestions}
        </span>{" "}
        ({result.scorePercent}%)
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {graded.map((a) => {
          const q = byId.get(a.questionId);
          return (
            <li
              key={a.questionId}
              className={`rounded-lg border p-3 text-sm ${
                a.isCorrect
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                  : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
              }`}
            >
              <p className="font-medium">
                Câu {a.questionNo} · {topikSectionLabel(a.section)}{" "}
                {a.isCorrect ? "✓" : "✗"}
              </p>
              {q ? (
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">{q.prompt}</p>
              ) : null}
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Đáp án đúng: {a.correctIndex + 1}
              </p>
              {a.explanation ? (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {a.explanation}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={backHref}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
        >
          Làm dạng khác
        </Link>
        <Link
          href={attemptHref}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
