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
    return "border-emerald-500/30 bg-emerald-500/10";
  }
  if (status === "pending") {
    return "border-amber-500/30 bg-amber-500/10";
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

export type AttemptListScoreLines = {
  mcqLine: string | null;
  writingLine: string | null;
  writingTone: "emerald" | "amber" | null;
};

/** Dòng điểm gọn cho danh sách lịch sử làm bài. */
export function getAttemptListScoreLines(attempt: {
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  writingSummary?: {
    writingCount: number;
    aiGradedCount: number;
    pendingCount: number;
    writingScore: number;
    writingMax: number;
  } | null;
}): AttemptListScoreLines {
  const ws = attempt.writingSummary;
  const writingCount = ws?.writingCount ?? 0;
  const mcqCount = attempt.totalQuestions - writingCount;

  let mcqLine: string | null = null;
  if (mcqCount > 0) {
    mcqLine = `Trắc nghiệm: ${attempt.correctCount}/${mcqCount} (${attempt.scorePercent}%)`;
  }

  let writingLine: string | null = null;
  let writingTone: "emerald" | "amber" | null = null;
  if (writingCount > 0 && ws) {
    if (ws.aiGradedCount > 0) {
      writingLine = `Viết (AI): ${ws.writingScore}${ws.writingMax > 0 ? `/${ws.writingMax}` : ""}`;
      if (ws.pendingCount > 0) {
        writingLine += ` · ${ws.pendingCount} câu chưa chấm`;
      }
      writingTone = "emerald";
    } else if (ws.pendingCount > 0) {
      writingLine = "Viết: chưa chấm được";
      writingTone = "amber";
    }
  }

  return { mcqLine, writingLine, writingTone };
}
