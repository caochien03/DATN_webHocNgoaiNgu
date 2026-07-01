import type { ToeicAttemptRow, ToeicQuestionFormat } from "@/lib/types";

export type FormatStats = {
  correctAnswers: number;
  totalAnswers: number;
  percent: number;
};

export function statsForToeicFormat(
  attempts: ToeicAttemptRow[],
  format: ToeicQuestionFormat,
): FormatStats {
  const matching = attempts.filter(
    (a) =>
      a.mode === "PRACTICE" &&
      a.tier === format.tier &&
      a.section === format.section &&
      a.formatFromNo === format.fromNo &&
      a.formatToNo === format.toNo,
  );

  let correctAnswers = 0;
  let totalAnswers = 0;
  for (const a of matching) {
    correctAnswers += a.correctCount;
    totalAnswers += a.totalQuestions;
  }

  return {
    correctAnswers,
    totalAnswers,
    percent:
      totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
  };
}
