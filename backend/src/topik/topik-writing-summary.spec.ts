import { TopikQuestionType, TopikSection } from '@prisma/client';
import { summarizeWritingFromAnswers } from './topik-writing-summary';
import type { GradedTopikAnswer } from './topik-grading';

function mcqAnswer(): GradedTopikAnswer {
  return {
    questionId: 'mcq-1',
    questionNo: 1,
    section: TopikSection.LISTENING,
    questionType: TopikQuestionType.MULTIPLE_CHOICE,
    selectedIndex: 0,
    correctIndex: 0,
    isCorrect: true,
    gradeStatus: 'graded',
    explanation: null,
  };
}

function pendingWriting(): GradedTopikAnswer {
  return {
    questionId: 'w-1',
    questionNo: 51,
    section: TopikSection.WRITING,
    questionType: TopikQuestionType.ESSAY,
    textAnswer: 'bài viết',
    isCorrect: null,
    gradeStatus: 'pending',
    explanation: null,
    maxScore: 50,
  };
}

function aiGradedWriting(): GradedTopikAnswer {
  return {
    questionId: 'w-2',
    questionNo: 54,
    section: TopikSection.WRITING,
    questionType: TopikQuestionType.ESSAY,
    textAnswer: 'bài viết',
    isCorrect: null,
    gradeStatus: 'ai_graded',
    explanation: null,
    maxScore: 50,
    aiScore: 42,
    aiFeedback: 'Khá tốt',
  };
}

describe('summarizeWritingFromAnswers', () => {
  it('returns null for MCQ-only attempts', () => {
    expect(summarizeWritingFromAnswers([mcqAnswer()])).toBeNull();
    expect(summarizeWritingFromAnswers([])).toBeNull();
    expect(summarizeWritingFromAnswers(null)).toBeNull();
  });

  it('counts pending writing answers', () => {
    const summary = summarizeWritingFromAnswers([pendingWriting()]);
    expect(summary).toEqual({
      writingCount: 1,
      aiGradedCount: 0,
      pendingCount: 1,
      writingScore: 0,
      writingMax: 0,
    });
  });

  it('sums AI writing scores', () => {
    const summary = summarizeWritingFromAnswers([
      mcqAnswer(),
      aiGradedWriting(),
      pendingWriting(),
    ]);
    expect(summary).toEqual({
      writingCount: 2,
      aiGradedCount: 1,
      pendingCount: 1,
      writingScore: 42,
      writingMax: 50,
    });
  });
});
