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
      <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50/80 p-2 dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          Điểm AI: {answer.aiScore ?? 0}
          {max != null ? `/${max}` : ""}
        </p>
        {answer.aiFeedback ? (
          <p className="mt-1 text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
            {answer.aiFeedback}
          </p>
        ) : null}
        {answer.writingPartResults?.some((p) => p.aiScore != null) ? (
          <ul className="mt-2 flex flex-col gap-1.5">
            {answer.writingPartResults.map((part) => (
              <li key={part.label} className="text-xs">
                <span className="font-medium">{part.label}</span>:{" "}
                {part.aiScore ?? 0}
                {part.maxScore != null ? `/${part.maxScore}` : ""}
                {part.aiFeedback ? (
                  <span className="text-emerald-900/70 dark:text-emerald-200/70">
                    {" "}
                    — {part.aiFeedback}
                  </span>
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
      <div className="mt-2 rounded-md border border-amber-200 bg-amber-50/80 p-2 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Bài đã lưu nhưng <strong>chưa chấm tự động</strong> (thiếu cấu hình
        Gemini hoặc dịch vụ AI tạm lỗi). Kiểm tra{" "}
        <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
          GEMINI_API_KEY
        </code>{" "}
        trên server rồi làm lại nếu cần.
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
        <p className="font-medium text-emerald-700 dark:text-emerald-300">
          Điểm viết (AI): {s.writingScore}
          {s.writingMax > 0 ? `/${s.writingMax}` : ""}
          <span className="ml-1 font-normal text-emerald-600/80 dark:text-emerald-400/80">
            · {s.aiGradedCount}/{s.writingCount} câu đã chấm
          </span>
        </p>
        {mcqLine ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            Trắc nghiệm: {mcqLine.correctCount}/{mcqLine.totalQuestions} (
            {mcqLine.scorePercent}%)
          </p>
        ) : null}
        {s.pendingCount > 0 ? (
          <p className="text-amber-700 dark:text-amber-300">
            {s.pendingCount} câu viết chưa chấm được — xem chi tiết bên dưới.
          </p>
        ) : null}
      </div>
    );
  }

  if (s.pendingCount > 0) {
    return (
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        {s.pendingCount} câu viết đã gửi —{" "}
        <strong>chưa chấm tự động</strong>. Bài vẫn được lưu trong lịch sử.
      </p>
    );
  }

  if (mcqLine) {
    return (
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Đúng{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {mcqLine.correctCount}/{mcqLine.totalQuestions}
        </span>{" "}
        ({mcqLine.scorePercent}%)
      </p>
    );
  }

  return null;
}
