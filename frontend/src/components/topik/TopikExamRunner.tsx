"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QuestionBlock } from "@/components/topik/TopikQuizRunner";
import { WritingQuestionFields } from "@/components/topik/TopikWritingRunner";
import {
  buildTopikSubmitAnswers,
  initWritingAnswerState,
  isWritingAnswerComplete,
  type TopikAnswerPayload,
  type WritingAnswerState,
} from "@/lib/topik-answers";
import { buildTopikExamSteps } from "@/lib/topik-exam-steps";
import { pageLabel, sharedAudioUrl } from "@/lib/group-topik-pages";
import { topikSectionLabel } from "@/lib/topik-labels";
import type { GradedTopikAnswer, TopikQuestion, TopikSubmitResult } from "@/lib/types";

type TopikExamRunnerProps = {
  title: string;
  subtitle?: string;
  questions: TopikQuestion[];
  backHref: string;
  onSubmit: (answers: TopikAnswerPayload[]) => Promise<TopikSubmitResult>;
};

export function TopikExamRunner({
  title,
  subtitle,
  questions,
  backHref,
  onSubmit,
}: TopikExamRunnerProps) {
  const steps = useMemo(() => buildTopikExamSteps(questions), [questions]);
  const [stepIndex, setStepIndex] = useState(0);
  const [mcqSelections, setMcqSelections] = useState<Record<string, number>>({});
  const [writingAnswers, setWritingAnswers] = useState<WritingAnswerState>(() =>
    initWritingAnswerState(questions),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopikSubmitResult | null>(null);

  const currentStep = steps[stepIndex];

  const allMcqAnswered = questions
    .filter((q) => q.questionType === "MULTIPLE_CHOICE" || !q.questionType)
    .every((q) => mcqSelections[q.id] !== undefined);

  const allWritingAnswered = questions
    .filter(
      (q) =>
        q.questionType === "SHORT_ANSWER" || q.questionType === "ESSAY",
    )
    .every((q) => isWritingAnswerComplete(q, writingAnswers));

  const allAnswered = allMcqAnswered && allWritingAnswered;

  const stepComplete = useMemo(() => {
    if (!currentStep) return false;
    if (currentStep.kind === "writing") {
      return isWritingAnswerComplete(currentStep.question, writingAnswers);
    }
    return currentStep.questions.every(
      (q) => mcqSelections[q.id] !== undefined,
    );
  }, [currentStep, writingAnswers, mcqSelections]);

  function pickMcq(questionId: string, optionIndex: number) {
    if (result) return;
    setMcqSelections((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function setWritingPart(
    questionId: string,
    partIndex: number | null,
    value: string,
  ) {
    if (result) return;
    setWritingAnswers((prev) => {
      const existing = prev[questionId];
      if (partIndex === null) {
        return { ...prev, [questionId]: value };
      }
      const parts = Array.isArray(existing) ? [...existing] : ["", ""];
      parts[partIndex] = value;
      return { ...prev, [questionId]: parts };
    });
  }

  async function finish() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = buildTopikSubmitAnswers(
        questions,
        mcqSelections,
        writingAnswers,
      );
      setResult(await onSubmit(payload));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không nộp được bài");
    } finally {
      setSubmitting(false);
    }
  }

  if (questions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">Đề thi chưa có câu hỏi.</p>
    );
  }

  if (result) {
    return (
      <ExamResultView
        result={result}
        questions={questions}
        backHref={backHref}
        attemptHref={`/topik/attempts/${result.attemptId}`}
      />
    );
  }

  const audio =
    currentStep?.kind === "mcq"
      ? sharedAudioUrl(currentStep.questions)
      : null;

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

      {currentStep ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500">
            Phần {stepIndex + 1}/{steps.length}
            {currentStep.kind === "mcq" ? (
              <> · {pageLabel(currentStep.questions, stepIndex)}</>
            ) : (
              <>
                {" "}
                · {topikSectionLabel(currentStep.question.section)} câu{" "}
                {currentStep.question.questionNo}
              </>
            )}
          </p>

          {audio ? (
            <audio className="mt-3 w-full" controls src={audio}>
              <track kind="captions" />
            </audio>
          ) : null}

          <div className="mt-4 flex flex-col gap-6">
            {currentStep.kind === "mcq" ? (
              currentStep.questions.map((q) => (
                <QuestionBlock
                  key={q.id}
                  question={q}
                  showAudio={!audio}
                  selectedIndex={mcqSelections[q.id]}
                  onPick={(i) => pickMcq(q.id, i)}
                />
              ))
            ) : (
              <WritingQuestionFields
                question={currentStep.question}
                value={writingAnswers[currentStep.question.id]}
                onChange={(partIndex, text) =>
                  setWritingPart(currentStep.question.id, partIndex, text)
                }
              />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((x) => x - 1)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              Phần trước
            </button>
            {stepIndex + 1 < steps.length ? (
              <button
                type="button"
                disabled={!stepComplete}
                onClick={() => setStepIndex((x) => x + 1)}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Phần sau
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

function ExamResultView({
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
  const pendingCount = graded.filter((a) => a.gradeStatus === "pending").length;

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
        {pendingCount > 0 ? (
          <span className="text-zinc-500">
            {" "}
            · {pendingCount} câu viết chờ chấm
          </span>
        ) : null}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {graded.map((a) => {
          const q = byId.get(a.questionId);
          const isPending = a.gradeStatus === "pending";
          return (
            <li
              key={a.questionId}
              className={`rounded-lg border p-3 text-sm ${
                isPending
                  ? "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30"
                  : a.isCorrect
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                    : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
              }`}
            >
              <p className="font-medium">
                Câu {a.questionNo} · {topikSectionLabel(a.section)}{" "}
                {isPending ? "· chờ chấm" : a.isCorrect ? "✓" : "✗"}
              </p>
              {q ? (
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">{q.prompt}</p>
              ) : null}
              {a.writingPartResults?.map((part) => (
                <p
                  key={part.label}
                  className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span className="font-medium">{part.label}</span>{" "}
                  {part.textAnswer}
                </p>
              ))}
              {a.textAnswer ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {a.textAnswer}
                </p>
              ) : null}
              {!isPending &&
              a.selectedIndex != null &&
              a.correctIndex != null ? (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Đáp án đúng: {a.correctIndex + 1}
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
          Quay lại
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
