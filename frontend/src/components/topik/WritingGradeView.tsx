import type { GradedTopikAnswer } from "@/lib/types";

/** Hiển thị điểm AI + nhận xét cho một câu viết đã chấm. */
export function WritingGradeView({ answer }: { answer: GradedTopikAnswer }) {
  if (answer.gradeStatus !== "ai_graded") return null;

  const max = answer.maxScore;
  return (
    <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900 dark:bg-emerald-950/30">
      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
        Điểm AI: {answer.aiScore ?? 0}
        {max != null ? `/${max}` : ""}
      </p>
      {answer.aiFeedback ? (
        <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-200/80">
          {answer.aiFeedback}
        </p>
      ) : null}
      {answer.writingPartResults?.some((p) => p.aiScore != null) ? (
        <ul className="mt-2 flex flex-col gap-1">
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

export function isWritingGraded(answer: GradedTopikAnswer): boolean {
  return answer.gradeStatus === "ai_graded";
}

export function isWritingPending(answer: GradedTopikAnswer): boolean {
  return answer.gradeStatus === "pending";
}
