"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { hasSessionProgress, useTopikLeaveGuard } from "@/components/topik/TopikRunGuards";
import { QuestionBlock } from "@/components/topik/TopikQuizRunner";
import { WritingQuestionFields } from "@/components/topik/TopikWritingRunner";
import { WritingGradeView, WritingResultSummary } from "@/components/topik/WritingGradeView";
import { WritingSubmitOverlay } from "@/components/topik/WritingSubmitOverlay";
import { TopikQuestionMap } from "@/components/topik/TopikQuestionMap";
import { useTopikExamTimer } from "@/hooks/useTopikExamTimer";
import {
  writingGradeCardClass,
  writingGradeTitleSuffix,
  writingGradeUiStatus,
} from "@/lib/topik-writing-grade-status";
import {
  buildTopikSubmitAnswers,
  initWritingAnswerState,
  isWritingAnswerComplete,
  type TopikAnswerPayload,
  type WritingAnswerState,
} from "@/lib/topik-answers";
import { buildTopikExamSteps } from "@/lib/topik-exam-steps";
import { pageLabel, sharedAudioUrl } from "@/lib/group-topik-pages";
import { buildExamQuestionMapItems } from "@/lib/topik-question-map";
import { topikSectionLabel } from "@/lib/topik-labels";
import type {
  GradedTopikAnswer,
  TopikQuestion,
  TopikSection,
  TopikSubmitResult,
} from "@/lib/types";

type TopikExamRunnerProps = {
  title: string;
  subtitle?: string;
  durationMinutes?: number;
  questions: TopikQuestion[];
  backHref: string;
  onSubmit: (answers: TopikAnswerPayload[]) => Promise<TopikSubmitResult>;
};

const SECTION_INTRO: Record<TopikSection, string> = {
  LISTENING: "Nghe audio và chọn đáp án phù hợp.",
  READING: "Đọc đoạn văn và chọn đáp án phù hợp.",
  WRITING: "Hoàn thành các câu viết theo yêu cầu.",
};

export function TopikExamRunner({
  title,
  subtitle,
  durationMinutes,
  questions,
  backHref,
  onSubmit,
}: TopikExamRunnerProps) {
  const steps = useMemo(() => buildTopikExamSteps(questions), [questions]);
  const writingQuestionCount = useMemo(
    () =>
      questions.filter(
        (q) => q.questionType === "SHORT_ANSWER" || q.questionType === "ESSAY",
      ).length,
    [questions],
  );
  const hasWriting = writingQuestionCount > 0;
  const [stepIndex, setStepIndex] = useState(0);
  const [mcqSelections, setMcqSelections] = useState<Record<string, number>>({});
  const [writingAnswers, setWritingAnswers] = useState<WritingAnswerState>(() =>
    initWritingAnswerState(questions),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopikSubmitResult | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

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
    if (currentStep.kind === "section-intro") return true;
    if (currentStep.kind === "writing") {
      return isWritingAnswerComplete(currentStep.question, writingAnswers);
    }
    return currentStep.questions.every(
      (q) => mcqSelections[q.id] !== undefined,
    );
  }, [currentStep, writingAnswers, mcqSelections]);

  const mapItems = useMemo(
    () =>
      buildExamQuestionMapItems(
        questions,
        steps,
        stepIndex,
        mcqSelections,
        writingAnswers,
      ),
    [questions, steps, stepIndex, mcqSelections, writingAnswers],
  );

  const hasProgress = hasSessionProgress(mcqSelections, writingAnswers);
  const { confirmLeave } = useTopikLeaveGuard(
    result == null && !submitting && hasProgress,
  );

  const finishRef = useRef<() => void>(() => {});

  const finish = useCallback(async () => {
    if (submitting || result) return;
    if (!allAnswered) {
      setError("Cần trả lời đủ tất cả câu trước khi nộp.");
      return;
    }
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
  }, [
    allAnswered,
    submitting,
    result,
    questions,
    mcqSelections,
    writingAnswers,
    onSubmit,
  ]);

  finishRef.current = () => {
    void finish();
  };

  const handleTimerExpire = useCallback(() => {
    setTimeExpired(true);
    if (allAnswered) {
      finishRef.current();
    }
  }, [allAnswered]);

  const timer = useTopikExamTimer(
    durationMinutes,
    handleTimerExpire,
    result != null,
  );

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

  const mcqPageIndex =
    currentStep?.kind === "mcq"
      ? steps
          .slice(0, stepIndex + 1)
          .filter((s) => s.kind === "mcq").length - 1
      : 0;

  return (
    <div>
      <WritingSubmitOverlay
        visible={submitting}
        hasWriting={hasWriting}
        writingCount={writingQuestionCount}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link
          href={backHref}
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          onClick={(e) => {
            if (!confirmLeave()) e.preventDefault();
          }}
        >
          ← Quay lại
        </Link>
        {timer.hasTimer && timer.label ? (
          <p
            className={`rounded-full px-3 py-1 text-sm font-medium tabular-nums ${
              timer.isLow || timeExpired
                ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
            }`}
          >
            {timeExpired ? "Hết giờ" : timer.label}
          </p>
        ) : null}
      </div>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      ) : null}

      {timeExpired && !allAnswered ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Đã hết thời gian làm bài. Hoàn thành các câu còn lại và nộp ngay.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <TopikQuestionMap
        items={mapItems}
        onSelect={(index) => setStepIndex(index)}
      />

      {currentStep ? (
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {currentStep.kind === "section-intro" ? (
            <SectionIntro
              section={currentStep.section}
              questionCount={currentStep.questionCount}
            />
          ) : (
            <>
              <p className="text-xs text-zinc-500">
                {topikSectionLabel(currentStep.section)} · Bước {stepIndex + 1}/
                {steps.length}
                {currentStep.kind === "mcq" ? (
                  <> · {pageLabel(currentStep.questions, mcqPageIndex)}</>
                ) : (
                  <> · câu {currentStep.question.questionNo}</>
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
            </>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((x) => x - 1)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              Trước
            </button>
            {stepIndex + 1 < steps.length ? (
              <button
                type="button"
                disabled={!stepComplete}
                onClick={() => setStepIndex((x) => x + 1)}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {currentStep.kind === "section-intro" ? "Bắt đầu" : "Tiếp"}
              </button>
            ) : (
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={() => void finish()}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {submitting
                  ? hasWriting
                    ? "Đang chấm…"
                    : "Đang nộp…"
                  : "Nộp bài"}
              </button>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SectionIntro({
  section,
  questionCount,
}: {
  section: TopikSection;
  questionCount: number;
}) {
  return (
    <div className="py-4 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
        Phần tiếp theo
      </p>
      <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {topikSectionLabel(section)}
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {SECTION_INTRO[section]}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{questionCount} câu</p>
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

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Kết quả
      </h2>
      <WritingResultSummary
        answers={graded}
        mcqLine={{
          correctCount: result.correctCount,
          totalQuestions: result.totalQuestions,
          scorePercent: result.scorePercent,
        }}
      />
      <ul className="mt-4 flex flex-col gap-3">
        {graded.map((a) => {
          const q = byId.get(a.questionId);
          const uiStatus = writingGradeUiStatus(a);
          const isPending = a.gradeStatus === "pending";
          const isAiGraded = a.gradeStatus === "ai_graded";
          const cardClass =
            uiStatus !== "mcq"
              ? writingGradeCardClass(uiStatus)
              : a.isCorrect
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30";
          return (
            <li
              key={a.questionId}
              className={`rounded-lg border p-3 text-sm ${cardClass}`}
            >
              <p className="font-medium">
                Câu {a.questionNo} · {topikSectionLabel(a.section)}{" "}
                {isAiGraded || isPending
                  ? writingGradeTitleSuffix(a)
                  : a.isCorrect
                    ? "✓"
                    : "✗"}
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
              <WritingGradeView answer={a} />
              {!isPending &&
              !isAiGraded &&
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
