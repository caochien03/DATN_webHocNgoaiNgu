import { TopikQuestionType } from '@prisma/client';
import {
  buildWritingGradingPrompt,
  parseWritingGradingResponse,
  type WritingGradingInput,
} from './topik-ai-grading';

describe('topik-ai-grading', () => {
  const essayInput: WritingGradingInput = {
    questionType: TopikQuestionType.ESSAY,
    prompt: '환경 보호에 대해 쓰십시오.',
    maxScore: 50,
    minChars: 600,
    maxChars: 700,
    textAnswer: '환경 보호는 중요합니다...',
    modelAnswer: '모범 답안...',
  };

  it('includes prompt, length range and max score in essay prompt', () => {
    const text = buildWritingGradingPrompt(essayInput);
    expect(text).toContain('환경 보호에 대해 쓰십시오.');
    expect(text).toContain('600–700 ký tự');
    expect(text).toContain('thang tối đa 50 điểm');
  });

  it('parses essay JSON and clamps score to maxScore', () => {
    const result = parseWritingGradingResponse(
      '```json\n{ "score": 80, "feedback": "Tốt" }\n```',
      essayInput,
    );
    expect(result.score).toBe(50);
    expect(result.feedback).toBe('Tốt');
  });

  const partInput: WritingGradingInput = {
    questionType: TopikQuestionType.SHORT_ANSWER,
    prompt: '㉠, ㉡에 쓰십시오.',
    maxScore: 10,
    parts: [
      {
        label: '㉠',
        textAnswer: '운동을 합니다',
        modelAnswer: 'x',
        maxScore: 5,
      },
      {
        label: '㉡',
        textAnswer: '건강해졌어요',
        modelAnswer: 'y',
        maxScore: 5,
      },
    ],
  };

  it('builds per-part prompt for multi-part questions', () => {
    const text = buildWritingGradingPrompt(partInput);
    expect(text).toContain('Ý ㉠');
    expect(text).toContain('Ý ㉡');
    expect(text).toContain('"parts"');
  });

  it('parses part scores by label and totals them', () => {
    const result = parseWritingGradingResponse(
      JSON.stringify({
        parts: [
          { label: '㉡', score: 4, feedback: 'b' },
          { label: '㉠', score: 9, feedback: 'a' },
        ],
        feedback: 'chung',
      }),
      partInput,
    );
    expect(result.parts).toHaveLength(2);
    expect(result.parts?.[0]).toEqual({ label: '㉠', score: 5, feedback: 'a' });
    expect(result.parts?.[1]).toEqual({ label: '㉡', score: 4, feedback: 'b' });
    expect(result.score).toBe(9);
    expect(result.feedback).toBe('chung');
  });

  it('throws on non-JSON response', () => {
    expect(() =>
      parseWritingGradingResponse('xin lỗi tôi không biết', essayInput),
    ).toThrow();
  });
});
