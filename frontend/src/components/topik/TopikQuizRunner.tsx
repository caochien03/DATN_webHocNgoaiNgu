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
import { BRAND, GRADIENT, scoreColor } from "@/components/ui-kit/brand";
import { topikSectionLabel } from "@/lib/topik-labels";
import { buildQuizQuestionMapItems } from "@/lib/topik-question-map";
import type { ExamMcqQuestion, ExamMcqSubmitResult } from "@/lib/types";

type TopikQuizRunnerProps = {
  title: string;
  subtitle?: string;
  questions: ExamMcqQuestion[];
  backHref: string;
  /** Đường dẫn gốc tới trang chi tiết bài làm (mặc định TOPIK). */
  attemptsBasePath?: string;
  onSubmit: (
    answers: { questionId: string; selectedIndex: number }[],
  ) => Promise<ExamMcqSubmitResult>;
};

export function TopikQuizRunner({
  title,
  subtitle,
  questions,
  backHref,
  attemptsBasePath = "/topik/attempts",
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
  const [result, setResult] = useState<ExamMcqSubmitResult | null>(null);

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
      <p className="text-sm text-muted-foreground">
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
        attemptHref={`${attemptsBasePath}/${result.attemptId}`}
      />
    );
  }

  return (
    <div>
      <Link
        href={backHref}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={(e) => {
          if (!confirmLeave()) e.preventDefault();
        }}
      >
        ← Quay lại
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <TopikQuestionMap
        items={mapItems}
        onSelect={(index) => setPageIndex(index)}
      />

      {currentPage.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">
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
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Trang trước
            </button>
            {pageIndex + 1 < pages.length ? (
              <button
                type="button"
                disabled={!pageAnswered}
                onClick={() => setPageIndex((x) => x + 1)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                Trang sau
              </button>
            ) : (
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={() => void finish()}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: GRADIENT }}
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
  question: ExamMcqQuestion;
  showAudio: boolean;
  selectedIndex: number | undefined;
  onPick: (index: number) => void;
}) {
  const imageOptions = usesImageOptions(question);

  return (
    <div className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <p className="text-xs font-medium text-muted-foreground">
        {topikSectionLabel(question.section)} · câu {question.questionNo}
      </p>
      {question.passage ? (
        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-secondary p-3 text-sm leading-relaxed text-foreground/90">
          {question.passage}
        </p>
      ) : null}
      {question.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={question.imageUrl}
          alt=""
          className="mt-2 max-h-80 w-full rounded-lg border border-border object-contain"
        />
      ) : null}
      {showAudio && question.audioUrl ? (
        <audio className="mt-2 w-full" controls src={question.audioUrl}>
          <track kind="captions" />
        </audio>
      ) : null}
      <h2 className="mt-2 text-base font-medium text-foreground">
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
              className="rounded-xl border px-3 py-2 text-left text-sm transition-colors"
              style={
                selected
                  ? {
                      borderColor: BRAND.blue,
                      backgroundColor: `${BRAND.blue}1a`,
                      color: "#fff",
                    }
                  : { borderColor: "var(--border)" }
              }
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

function optionImageAt(question: ExamMcqQuestion, index: number): string | null {
  const url = question.optionImageUrls?.[index]?.trim();
  return url || null;
}

function usesImageOptions(question: ExamMcqQuestion): boolean {
  return question.options.some((_, i) => optionImageAt(question, i) != null);
}

function ResultView({
  result,
  questions,
  backHref,
  attemptHref,
}: {
  result: ExamMcqSubmitResult;
  questions: ExamMcqQuestion[];
  backHref: string;
  attemptHref: string;
}) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const graded = result.answers;

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p
          className="text-4xl font-bold"
          style={{ color: scoreColor(result.scorePercent) }}
        >
          {result.scorePercent}%
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Đúng {result.correctCount}/{result.totalQuestions} câu
        </p>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {graded.map((a) => {
          const q = byId.get(a.questionId);
          const tint =
            a.gradeStatus === "pending"
              ? BRAND.cyan
              : a.isCorrect
                ? BRAND.green
                : BRAND.red;
          return (
            <li
              key={a.questionId}
              className="rounded-xl border p-4 text-sm"
              style={{ borderColor: `${tint}40`, backgroundColor: `${tint}12` }}
            >
              <p className="font-medium text-foreground">
                Câu {a.questionNo} · {topikSectionLabel(a.section)}{" "}
                {a.gradeStatus === "pending"
                  ? "· chờ chấm"
                  : a.isCorrect
                    ? "✓"
                    : "✗"}
              </p>
              {q ? (
                <p className="mt-1 text-foreground/80">{q.prompt}</p>
              ) : null}
              {a.textAnswer ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                  {a.textAnswer}
                </p>
              ) : null}
              {a.gradeStatus === "graded" &&
              a.selectedIndex != null &&
              a.correctIndex != null ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Đáp án đúng: {a.correctIndex + 1}
                </p>
              ) : null}
              {a.modelAnswer ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Đáp án mẫu: {a.modelAnswer}
                </p>
              ) : null}
              {a.explanation ? (
                <p className="mt-1 text-xs text-muted-foreground">
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
          className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Làm dạng khác
        </Link>
        <Link
          href={attemptHref}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: GRADIENT }}
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
