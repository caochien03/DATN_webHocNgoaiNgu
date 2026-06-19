import type { GradedTopikAnswer } from './topik-grading';

export type TopikWritingSummary = {
  writingCount: number;
  aiGradedCount: number;
  pendingCount: number;
  writingScore: number;
  writingMax: number;
};

function writingGradeUiStatus(
  answer: GradedTopikAnswer,
): 'ai_graded' | 'pending' | 'mcq' {
  if (answer.gradeStatus === 'ai_graded') return 'ai_graded';
  if (
    answer.gradeStatus === 'pending' ||
    answer.textAnswer != null ||
    (answer.writingPartResults?.length ?? 0) > 0
  ) {
    return 'pending';
  }
  return 'mcq';
}

export function summarizeWritingFromAnswers(
  answers: unknown,
): TopikWritingSummary | null {
  if (!Array.isArray(answers) || answers.length === 0) return null;

  const graded = answers as GradedTopikAnswer[];
  const writing = graded.filter((a) => writingGradeUiStatus(a) !== 'mcq');
  if (writing.length === 0) return null;

  const aiGraded = writing.filter((a) => a.gradeStatus === 'ai_graded');
  const pending = writing.filter((a) => a.gradeStatus === 'pending');
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
