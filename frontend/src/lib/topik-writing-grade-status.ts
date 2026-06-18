import type { GradedTopikAnswer } from "@/lib/types";

export type WritingGradeUiStatus = "ai_graded" | "pending" | "mcq";

export function writingGradeUiStatus(
  answer: GradedTopikAnswer,
): WritingGradeUiStatus {
  if (answer.gradeStatus === "ai_graded") return "ai_graded";
  if (
    answer.gradeStatus === "pending" ||
    answer.textAnswer != null ||
    (answer.writingPartResults?.length ?? 0) > 0
  ) {
    return "pending";
  }
  return "mcq";
}

export function summarizeWritingGrades(answers: GradedTopikAnswer[]) {
  const writing = answers.filter(
    (a) => writingGradeUiStatus(a) !== "mcq",
  );
  const aiGraded = writing.filter((a) => a.gradeStatus === "ai_graded");
  const pending = writing.filter((a) => a.gradeStatus === "pending");
  const writingScore = aiGraded.reduce((s, a) => s + (a.aiScore ?? 0), 0);
  const writingMax = aiGraded.reduce((s, a) => s + (a.maxScore ?? 0), 0);
  return {
    writingCount: writing.length,
    aiGradedCount: aiGraded.length,
    pendingCount: pending.length,
    writingScore: Math.round(writingScore * 10) / 10,
    writingMax,
  };
}

export function writingGradeStatusLabel(status: WritingGradeUiStatus): string {
  if (status === "ai_graded") return "Đã chấm AI";
  if (status === "pending") return "Chưa chấm được";
  return "";
}

export function writingGradeCardClass(status: WritingGradeUiStatus): string {
  if (status === "ai_graded") {
    return "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30";
  }
  if (status === "pending") {
    return "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30";
  }
  return "";
}

export function writingGradeTitleSuffix(answer: GradedTopikAnswer): string {
  if (answer.gradeStatus === "ai_graded") {
    return `· ${answer.aiScore ?? 0}${answer.maxScore != null ? `/${answer.maxScore}` : ""}`;
  }
  if (writingGradeUiStatus(answer) === "pending") return "· chưa chấm được";
  return "";
}
