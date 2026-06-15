import { getWritingPartCount, parseWritingParts } from './topik-writing-parts';
import { TopikQuestionType } from '@prisma/client';

describe('topik-writing-parts', () => {
  it('parses two-part short answer (51–52)', () => {
    const parts = parseWritingParts([
      { label: '㉠', modelAnswer: 'a' },
      { label: '㉡', modelAnswer: 'b' },
    ]);
    expect(parts).toHaveLength(2);
    expect(parts![0].label).toBe('㉠');
  });

  it('counts writing parts for short answer', () => {
    expect(
      getWritingPartCount({
        questionType: TopikQuestionType.SHORT_ANSWER,
        writingParts: [{ label: '㉠' }, { label: '㉡' }],
      }),
    ).toBe(2);
  });
});
