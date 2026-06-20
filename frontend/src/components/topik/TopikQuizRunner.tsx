"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { hasMcqSelections, useTopikLeaveGuard } from "@/components/topik/TopikRunGuards";
import {
  groupTopikQuestionsIntoPages,
  pageLabel,
  sharedAudioUrl,
} from "@/lib/group-topik-pages";
import { TopikQuestionMap } from "@/components/topik/TopikQuestionMap";
import { topikSectionLabel } from "@/lib/topik-labels";
import { buildQuizQuestionMapItems } from "@/lib/topik-question-map";
import type { GradedTopikAnswer, TopikQuestion, TopikSubmitResult } from "@/lib/types";

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
  const pages = useMemo(
    () => groupTopikQuestionsIntoPages(questions),
    [questions],
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopikSubmitResult | null>(null);

  const currentPage = pages[pageIndex] ?? [];
  const allAnswered = questions.every((q) => selections[q.id] !== undefined);
  const pageAnswered = currentPage.every((q) => selections[q.id] !== undefined);
  const audio = sharedAudioUrl(currentPage);

  const mapItems = useMemo(
    () => buildQuizQuestionMapItems(questions, pages, pageIndex, selections),
    [questions, pages, pageIndex, selections],
  );

  const hasProgress = hasMcqSelections(selections);
  const { confirmLeave } = useTopikLeaveGuard(
    result == null && !submitting && hasProgress,
  );

  function pick(questionId: string, optionIndex: number) {
    if (result) return;
    setSelections((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  const finish = useCallback(async () => {
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
  }, [allAnswered, submitting, questions, selections, onSubmit]);

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
        onClick={(e) => {
          if (!confirmLeave()) e.preventDefault();
        }}
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

      <TopikQuestionMap
        items={mapItems}
        onSelect={(index) => setPageIndex(index)}
      />

      {currentPage.length > 0 ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500">
            {pageLabel(currentPage, pageIndex)} · Trang {pageIndex + 1}/
            {pages.length}
            {currentPage.length === 1 ? (
              <>
                {" "}
                · {topikSectionLabel(currentPage[0].section)} #
                {currentPage[0].questionNo}
              </>
            ) : null}
          </p>

          {audio ? (
            <audio className="mt-3 w-full" controls src={audio}>
              <track kind="captions" />
            </audio>
          ) : null}

          <div className="mt-4 flex flex-col gap-6">
            {currentPage.map((q) => (
              <QuestionBlock
                key={q.id}
                question={q}
                showAudio={!audio}
                selectedIndex={selections[q.id]}
                onPick={(i) => pick(q.id, i)}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((x) => x - 1)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              Trang trước
            </button>
            {pageIndex + 1 < pages.length ? (
              <button
                type="button"
                disabled={!pageAnswered}
                onClick={() => setPageIndex((x) => x + 1)}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Trang sau
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

export function QuestionBlock({
  question,
  showAudio,
  selectedIndex,
  onPick,
}: {
  question: TopikQuestion;
  showAudio: boolean;
  selectedIndex: number | undefined;
  onPick: (index: number) => void;
}) {
  const imageOptions = usesImageOptions(question);

  return (
    <div className="border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0 dark:border-zinc-800">
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {topikSectionLabel(question.section)} · câu {question.questionNo}
      </p>
      {question.passage ? (
        <p className="mt-2 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {question.passage}
        </p>
      ) : null}
      {question.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={question.imageUrl}
          alt=""
          className="mt-2 max-h-80 w-full rounded-md border border-zinc-200 object-contain dark:border-zinc-700"
        />
      ) : null}
      {showAudio && question.audioUrl ? (
        <audio className="mt-2 w-full" controls src={question.audioUrl}>
          <track kind="captions" />
        </audio>
      ) : null}
      <h2 className="mt-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
        {question.prompt}
      </h2>
      <div
        className={`mt-3 gap-2 ${imageOptions ? "grid grid-cols-2" : "grid grid-cols-1"}`}
      >
        {question.options.map((opt, i) => {
          const selected = selectedIndex === i;
          const optionImage = optionImageAt(question, i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(i)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                selected
                  ? "border-zinc-900 bg-zinc-100 dark:border-zinc-300 dark:bg-zinc-800"
                  : "border-zinc-300 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              {optionImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={optionImage}
                  alt={opt || `Đáp án ${i + 1}`}
                  className="mx-auto max-h-36 w-full object-contain"
                />
              ) : null}
              <span className={optionImage ? "mt-2 block text-center" : ""}>
                {opt ? `${i + 1}. ${opt}` : `${i + 1}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function optionImageAt(question: TopikQuestion, index: number): string | null {
  const url = question.optionImageUrls?.[index]?.trim();
  return url || null;
}

function usesImageOptions(question: TopikQuestion): boolean {
  return question.options.some((_, i) => optionImageAt(question, i) != null);
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
                a.gradeStatus === "pending"
                  ? "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30"
                  : a.isCorrect
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                    : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
              }`}
            >
              <p className="font-medium">
                Câu {a.questionNo} · {topikSectionLabel(a.section)}{" "}
                {a.gradeStatus === "pending"
                  ? "· chờ chấm"
                  : a.isCorrect
                    ? "✓"
                    : "✗"}
              </p>
              {q ? (
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">{q.prompt}</p>
              ) : null}
              {a.textAnswer ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {a.textAnswer}
                </p>
              ) : null}
              {a.gradeStatus === "graded" &&
              a.selectedIndex != null &&
              a.correctIndex != null ? (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Đáp án đúng: {a.correctIndex + 1}
                </p>
              ) : null}
              {a.modelAnswer ? (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Đáp án mẫu: {a.modelAnswer}
                </p>
              ) : null}
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
