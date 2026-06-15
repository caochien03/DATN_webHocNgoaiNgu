import { TopikQuestionType, TopikSection } from '@prisma/client';
import {
  assertQuestionInput,
  isWritingQuestionType,
} from './topik-question-validation';

describe('topik-question-validation', () => {
  it('rejects MULTIPLE_CHOICE in WRITING section', () => {
    expect(() =>
      assertQuestionInput({
        tier: 'TOPIK_II' as const,
        section: TopikSection.WRITING,
        questionType: TopikQuestionType.MULTIPLE_CHOICE,
        options: ['a', 'b'],
        correctIndex: 0,
      }),
    ).toThrow(/SHORT_ANSWER/);
  });

  it('allows ESSAY in WRITING with empty options', () => {
    expect(() =>
      assertQuestionInput({
        tier: 'TOPIK_II' as const,
        section: TopikSection.WRITING,
        questionType: TopikQuestionType.ESSAY,
        options: [],
        correctIndex: 0,
        minChars: 200,
        maxChars: 300,
      }),
    ).not.toThrow();
  });

  it('isWritingQuestionType identifies writing types', () => {
    expect(isWritingQuestionType(TopikQuestionType.ESSAY)).toBe(true);
    expect(isWritingQuestionType(TopikQuestionType.MULTIPLE_CHOICE)).toBe(
      false,
    );
  });
});
