import type { GradedTopikAnswer } from "@/lib/types";
import {
  summarizeWritingGrades,
  writingGradeUiStatus,
} from "@/lib/topik-writing-grade-status";

/** Hiển thị điểm AI + nhận xét cho một câu viết đã chấm. */
export function WritingGradeView({ answer }: { answer: GradedTopikAnswer }) {
  if (answer.gradeStatus === "ai_graded") {
    const max = answer.maxScore;
    return (
      <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
        <p className="text-sm font-semibold text-emerald-300">
          Điểm AI: {answer.aiScore ?? 0}
          {max != null ? `/${max}` : ""}
        </p>
        {answer.aiFeedback ? (
          <p className="mt-1 text-xs leading-relaxed text-emerald-200/80">
            {answer.aiFeedback}
          </p>
        ) : null}
        {answer.writingPartResults?.some((p) => p.aiScore != null) ? (
          <ul className="mt-2 flex flex-col gap-1.5">
            {answer.writingPartResults.map((part) => (
              <li key={part.label} className="text-xs text-emerald-100/90">
                <span className="font-medium">{part.label}</span>:{" "}
                {part.aiScore ?? 0}
                {part.maxScore != null ? `/${part.maxScore}` : ""}
                {part.aiFeedback ? (
                  <span className="text-emerald-200/70"> — {part.aiFeedback}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (writingGradeUiStatus(answer) === "pending") {
    return (
      <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs leading-relaxed text-amber-200">
        Bài đã lưu nhưng <strong>chưa chấm tự động</strong> (dịch vụ AI tạm
        không khả dụng lúc nộp). Dùng nút <strong>Chấm lại bằng AI</strong>{" "}
        phía trên để thử lại.
      </div>
    );
  }

  return null;
}

type WritingResultSummaryProps = {
  answers: GradedTopikAnswer[];
  mcqLine?: { correctCount: number; totalQuestions: number; scorePercent: number };
};

/** Dòng tóm tắt điểm sau khi nộp (viết + MCQ nếu có). */
export function WritingResultSummary({
  answers,
  mcqLine,
}: WritingResultSummaryProps) {
  const s = summarizeWritingGrades(answers);

  if (s.aiGradedCount > 0) {
    return (
      <div className="mt-2 space-y-1 text-sm">
        <p className="font-semibold text-emerald-300">
          Điểm viết (AI): {s.writingScore}
          {s.writingMax > 0 ? `/${s.writingMax}` : ""}
          <span className="ml-1 font-normal text-emerald-400/80">
            · {s.aiGradedCount}/{s.writingCount} câu đã chấm
          </span>
        </p>
        {mcqLine ? (
          <p className="text-muted-foreground">
            Trắc nghiệm: {mcqLine.correctCount}/{mcqLine.totalQuestions} (
            {mcqLine.scorePercent}%)
          </p>
        ) : null}
        {s.pendingCount > 0 ? (
          <p className="text-amber-300">
            {s.pendingCount} câu viết chưa chấm được — xem chi tiết bên dưới.
          </p>
        ) : null}
      </div>
    );
  }

  if (s.pendingCount > 0) {
    return (
      <p className="mt-2 text-sm text-amber-300">
        {s.pendingCount} câu viết đã gửi —{" "}
        <strong>chưa chấm tự động</strong>. Bài vẫn được lưu trong lịch sử.
      </p>
    );
  }

  if (mcqLine) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Đúng{" "}
        <span className="font-semibold text-foreground">
          {mcqLine.correctCount}/{mcqLine.totalQuestions}
        </span>{" "}
        ({mcqLine.scorePercent}%)
      </p>
    );
  }

  return null;
}
