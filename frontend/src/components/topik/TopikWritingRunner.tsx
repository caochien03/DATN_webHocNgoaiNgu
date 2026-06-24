"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { hasWritingDraft, useTopikLeaveGuard } from "@/components/topik/TopikRunGuards";
import {
  buildTopikSubmitAnswers,
  initWritingAnswerState,
  isWritingAnswerComplete,
  type TopikAnswerPayload,
  type WritingAnswerState,
} from "@/lib/topik-answers";
import { WritingGradeView, WritingResultSummary } from "@/components/topik/WritingGradeView";
import { WritingSubmitOverlay } from "@/components/topik/WritingSubmitOverlay";
import { TopikQuestionMap } from "@/components/topik/TopikQuestionMap";
import { topikQuestionTypeLabel, topikSectionLabel } from "@/lib/topik-labels";
import {
  writingGradeCardClass,
  writingGradeTitleSuffix,
  writingGradeUiStatus,
} from "@/lib/topik-writing-grade-status";
import {
  DEFAULT_SHORT_ANSWER_PARTS,
  getWritingPartCount,
} from "@/lib/topik-writing-parts";
import { buildWritingQuestionMapItems } from "@/lib/topik-question-map";
import { GRADIENT } from "@/components/ui-kit/brand";
import type { GradedTopikAnswer, TopikQuestion, TopikSubmitResult } from "@/lib/types";

const textareaClass =
  "w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20";

type TopikWritingRunnerProps = {
  title: string;
  subtitle?: string;
  questions: TopikQuestion[];
  backHref: string;
  onSubmit: (answers: TopikAnswerPayload[]) => Promise<TopikSubmitResult>;
};

export function TopikWritingRunner({
  title,
  subtitle,
  questions,
  backHref,
  onSubmit,
}: TopikWritingRunnerProps) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.questionNo - b.questionNo),
    [questions],
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState<WritingAnswerState>(() =>
    initWritingAnswerState(sorted),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopikSubmitResult | null>(null);

  const current = sorted[pageIndex];
  const allAnswered = sorted.every((q) => isWritingAnswerComplete(q, answers));
  const pageAnswered =
    current != null && isWritingAnswerComplete(current, answers);

  const mapItems = useMemo(
    () => buildWritingQuestionMapItems(sorted, pageIndex, answers),
    [sorted, pageIndex, answers],
  );

  const hasProgress = hasWritingDraft(answers);
  const { confirmLeave } = useTopikLeaveGuard(
    result == null && !submitting && hasProgress,
  );

  function setPartAnswer(
    questionId: string,
    partIndex: number | null,
    value: string,
  ) {
    if (result) return;
    setAnswers((prev) => {
      const existing = prev[questionId];
      if (partIndex === null) {
        return { ...prev, [questionId]: value };
      }
      const parts = Array.isArray(existing)
        ? [...existing]
        : getWritingPartCount(
              sorted.find((q) => q.id === questionId) ?? {
                questionType: "SHORT_ANSWER",
              },
            ) > 1
          ? DEFAULT_SHORT_ANSWER_PARTS.map(() => "")
          : [""];
      parts[partIndex] = value;
      return { ...prev, [questionId]: parts };
    });
  }

  async function finish() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = buildTopikSubmitAnswers(sorted, {}, answers);
      setResult(await onSubmit(payload));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không nộp được bài");
    } finally {
      setSubmitting(false);
    }
  }

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có câu hỏi. Quay lại và chọn dạng khác.
      </p>
    );
  }

  if (result) {
    return (
      <WritingResultView
        result={result}
        questions={sorted}
        backHref={backHref}
        attemptHref={`/topik/attempts/${result.attemptId}`}
      />
    );
  }

  return (
    <div>
      <WritingSubmitOverlay
        visible={submitting}
        hasWriting
        writingCount={sorted.length}
      />
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

      {current ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">
            Câu {current.questionNo} · {topikSectionLabel(current.section)} ·{" "}
            {topikQuestionTypeLabel(current.questionType)} · {pageIndex + 1}/
            {sorted.length}
          </p>

          <WritingQuestionFields
            question={current}
            value={answers[current.id]}
            onChange={(partIndex, text) =>
              setPartAnswer(current.id, partIndex, text)
            }
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((x) => x - 1)}
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Câu trước
            </button>
            {pageIndex + 1 < sorted.length ? (
              <button
                type="button"
                disabled={!pageAnswered}
                onClick={() => setPageIndex((x) => x + 1)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                Câu sau
              </button>
            ) : (
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={() => void finish()}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                {submitting ? "Đang chấm…" : "Nộp bài"}
              </button>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function WritingQuestionFields({
  question,
  value,
  onChange,
}: {
  question: TopikQuestion;
  value: string | string[] | undefined;
  onChange: (partIndex: number | null, text: string) => void;
}) {
  const partCount = getWritingPartCount(question);
  const parts =
    question.writingParts && question.writingParts.length > 0
      ? question.writingParts
      : DEFAULT_SHORT_ANSWER_PARTS;

  return (
    <div className="mt-4">
      {question.passage ? (
        <p className="whitespace-pre-wrap rounded-lg bg-secondary p-3 text-sm leading-relaxed text-foreground/90">
          {question.passage}
        </p>
      ) : null}
      {question.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={question.imageUrl}
          alt=""
          className="mt-3 max-h-80 w-full rounded-lg border border-border object-contain"
        />
      ) : null}
      <h2 className="mt-3 text-base font-medium text-foreground">
        {question.prompt}
      </h2>

      {partCount > 1 ? (
        <div className="mt-4 flex flex-col gap-4">
          {parts.slice(0, partCount).map((part, i) => (
            <label key={part.label} className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">{part.label}</span>
              <input
                type="text"
                value={Array.isArray(value) ? (value[i] ?? "") : ""}
                onChange={(e) => onChange(i, e.target.value)}
                className={textareaClass}
                placeholder={`Viết câu trả lời cho ${part.label}…`}
              />
            </label>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(null, e.target.value)}
            rows={question.questionType === "ESSAY" ? 14 : 4}
            className={`${textareaClass} min-h-[120px] resize-y`}
            placeholder="Viết bài của bạn…"
          />
          {question.questionType === "ESSAY" &&
          (question.minChars != null || question.maxChars != null) ? (
            <CharCountHint
              text={typeof value === "string" ? value : ""}
              minChars={question.minChars}
              maxChars={question.maxChars}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function CharCountHint({
  text,
  minChars,
  maxChars,
}: {
  text: string;
  minChars?: number | null;
  maxChars?: number | null;
}) {
  const len = text.length;
  const belowMin = minChars != null && len > 0 && len < minChars;
  const aboveMax = maxChars != null && len > maxChars;

  return (
    <p
      className={`mt-2 text-xs ${
        belowMin || aboveMax ? "text-amber-300" : "text-muted-foreground"
      }`}
    >
      {len} ký tự
      {minChars != null || maxChars != null ? (
        <>
          {" "}
          (gợi ý:{" "}
          {minChars != null && maxChars != null
            ? `${minChars}–${maxChars}`
            : minChars != null
              ? `tối thiểu ${minChars}`
              : `tối đa ${maxChars}`}
          )
        </>
      ) : null}
      {belowMin ? " · còn ngắn so với gợi ý" : null}
      {aboveMax ? " · vượt gợi ý độ dài" : null}
    </p>
  );
}

function WritingResultView({
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
      <h2 className="text-2xl font-bold text-foreground">Đã nộp bài</h2>
      <WritingResultSummary answers={graded} />
      <ul className="mt-4 flex flex-col gap-3">
        {graded.map((a) => {
          const q = byId.get(a.questionId);
          const uiStatus = writingGradeUiStatus(a);
          return (
            <li
              key={a.questionId}
              className={`rounded-xl border p-4 text-sm ${writingGradeCardClass(uiStatus)}`}
            >
              <p className="font-medium text-foreground">
                Câu {a.questionNo} · {topikSectionLabel(a.section)}{" "}
                {writingGradeTitleSuffix(a)}
              </p>
              {q ? (
                <p className="mt-1 text-foreground/80">{q.prompt}</p>
              ) : null}
              {a.writingPartResults?.length ? (
                <ul className="mt-2 flex flex-col gap-2">
                  {a.writingPartResults.map((part) => (
                    <li key={part.label}>
                      <span className="text-xs font-medium text-foreground">
                        {part.label}
                      </span>
                      <p className="mt-1 whitespace-pre-wrap text-foreground/80">
                        {part.textAnswer}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
              {a.textAnswer ? (
                <p className="mt-2 whitespace-pre-wrap text-foreground/80">
                  {a.textAnswer}
                </p>
              ) : null}
              <WritingGradeView answer={a} />
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
