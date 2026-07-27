"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardList, Send, Trophy } from "lucide-react";
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
import { BRAND, GRADIENT, GRADIENT_DIAGONAL, scoreColor } from "@/components/ui-kit/brand";
import { topikSectionLabel } from "@/lib/topik-labels";
import type {
  ExamMcqQuestion,
  ExamMcqSubmitResult,
  GradedTopikAnswer,
  TopikSection,
} from "@/lib/types";

type TopikExamRunnerProps = {
  title: string;
  subtitle?: string;
  durationMinutes?: number;
  questions: ExamMcqQuestion[];
  backHref: string;
  attemptsBasePath?: string;
  onSubmit: (answers: TopikAnswerPayload[]) => Promise<ExamMcqSubmitResult>;
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
  attemptsBasePath = "/topik/attempts",
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
  const [result, setResult] = useState<ExamMcqSubmitResult | null>(null);
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
      <p className="text-sm text-muted-foreground">Đề thi chưa có câu hỏi.</p>
    );
  }

  if (result) {
    return (
      <ExamResultView
        result={result}
        questions={questions}
        backHref={backHref}
        attemptHref={`${attemptsBasePath}/${result.attemptId}`}
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
      <header className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => {
              if (!confirmLeave()) e.preventDefault();
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </Link>
          {timer.hasTimer && timer.label ? (
            <p
              className="rounded-full px-3 py-1.5 text-sm font-bold tabular-nums"
              style={
                timer.isLow || timeExpired
                  ? { backgroundColor: `${BRAND.red}1f`, color: BRAND.red }
                  : { backgroundColor: "rgba(255,255,255,0.07)", color: "var(--foreground)" }
              }
            >
              {timeExpired ? "Hết giờ" : timer.label}
            </p>
          ) : null}
        </div>
        <div className="mt-5 flex items-start gap-3.5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ background: GRADIENT_DIAGONAL }}
          >
            <ClipboardList size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
      </header>

      {timeExpired && !allAnswered ? (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Đã hết thời gian làm bài. Hoàn thành các câu còn lại và nộp ngay.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <TopikQuestionMap
        items={mapItems}
        onSelect={(index) => setStepIndex(index)}
      />

      {currentStep ? (
        <section className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
          {currentStep.kind === "section-intro" ? (
            <SectionIntro
              section={currentStep.section}
              questionCount={currentStep.questionCount}
            />
          ) : (
            <>
              <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
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

          <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-border pt-5">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((x) => x - 1)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeft size={16} /> Trước
            </button>
            {stepIndex + 1 < steps.length ? (
              <button
                type="button"
                disabled={!stepComplete}
                onClick={() => setStepIndex((x) => x + 1)}
                className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                {currentStep.kind === "section-intro" ? "Bắt đầu" : "Tiếp"} <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={() => void finish()}
                className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                <Send size={16} />
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
    <div className="rounded-2xl bg-secondary/55 px-5 py-7 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.cyan }}>
        Phần tiếp theo
      </p>
      <h2 className="mt-2 text-xl font-bold text-foreground">
        {topikSectionLabel(section)}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {SECTION_INTRO[section]}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">{questionCount} câu</p>
    </div>
  );
}

function ExamResultView({
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
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 text-center shadow-sm">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-24 w-56 -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: `${scoreColor(result.scorePercent)}26` }}
        />
        <Trophy className="relative mx-auto" size={24} style={{ color: scoreColor(result.scorePercent) }} />
        <p
          className="relative mt-3 text-5xl font-bold tracking-tight"
          style={{ color: scoreColor(result.scorePercent) }}
        >
          {result.scorePercent}%
        </p>
        <p className="relative mt-2 text-sm text-muted-foreground">
          Trắc nghiệm đúng {result.correctCount}/{result.totalQuestions} câu
        </p>
        <div className="mt-2">
          <WritingResultSummary
            answers={graded as GradedTopikAnswer[]}
            mcqLine={{
              correctCount: result.correctCount,
              totalQuestions: result.totalQuestions,
              scorePercent: result.scorePercent,
            }}
          />
        </div>
      </div>
      <ul className="mt-5 flex flex-col gap-3">
        {graded.map((raw) => {
          const a = raw as GradedTopikAnswer;
          const q = byId.get(a.questionId);
          const uiStatus = writingGradeUiStatus(a);
          const isPending = a.gradeStatus === "pending";
          const isAiGraded = a.gradeStatus === "ai_graded";
          const mcqTint = a.isCorrect ? BRAND.green : BRAND.red;
          return (
            <li
              key={a.questionId}
              className={`rounded-2xl border p-4 text-sm shadow-sm ${
                uiStatus !== "mcq" ? writingGradeCardClass(uiStatus) : ""
              }`}
              style={
                uiStatus === "mcq"
                  ? { borderColor: `${mcqTint}40`, backgroundColor: `${mcqTint}12` }
                  : undefined
              }
            >
              <p className="font-medium text-foreground">
                Câu {a.questionNo} · {topikSectionLabel(a.section)}{" "}
                {isAiGraded || isPending
                  ? writingGradeTitleSuffix(a)
                  : a.isCorrect
                    ? "✓"
                    : "✗"}
              </p>
              {q ? (
                <p className="mt-1 text-foreground/80">{q.prompt}</p>
              ) : null}
              {a.writingPartResults?.map((part) => (
                <p
                  key={part.label}
                  className="mt-2 whitespace-pre-wrap text-sm text-foreground/80"
                >
                  <span className="font-medium text-foreground">{part.label}</span>{" "}
                  {part.textAnswer}
                </p>
              ))}
              {a.textAnswer ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                  {a.textAnswer}
                </p>
              ) : null}
              <WritingGradeView answer={a} />
              {!isPending &&
              !isAiGraded &&
              a.selectedIndex != null &&
              a.correctIndex != null ? (
                <p className="mt-1 text-xs text-muted-foreground">
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
          className="rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Quay lại
        </Link>
        <Link
          href={attemptHref}
          className="rounded-2xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: GRADIENT }}
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
