import { TopikQuestionType } from '@prisma/client';

export type WritingGradingPart = {
  label: string;
  textAnswer: string;
  modelAnswer?: string | null;
  maxScore?: number | null;
};

export type WritingGradingInput = {
  questionType: TopikQuestionType;
  prompt: string;
  passage?: string | null;
  modelAnswer?: string | null;
  rubric?: unknown;
  maxScore?: number | null;
  minChars?: number | null;
  maxChars?: number | null;
  /// Câu viết đơn / luận.
  textAnswer?: string | null;
  /// Câu nhiều ý (51–52).
  parts?: WritingGradingPart[];
};

export type WritingGradingPartResult = {
  label: string;
  score: number;
  feedback: string;
};

export type WritingGradingResult = {
  score: number;
  feedback: string;
  parts?: WritingGradingPartResult[];
};

function clampScore(value: unknown, max: number | null | undefined): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  const ceiling = max != null && max > 0 ? max : n;
  return Math.round(Math.min(n, ceiling) * 10) / 10;
}

/** Xây prompt yêu cầu Gemini chấm bài viết TOPIK II, trả JSON nghiêm ngặt. */
export function buildWritingGradingPrompt(input: WritingGradingInput): string {
  const lines: string[] = [];
  lines.push(
    'Bạn là giám khảo chấm bài thi viết TOPIK II (한국어능력시험 쓰기).',
    'Hãy chấm bài của thí sinh một cách công bằng theo thang điểm và tiêu chí cho trước.',
    'Đánh giá nội dung, ngữ pháp, từ vựng và tính phù hợp với yêu cầu đề.',
    'Phản hồi (feedback) viết bằng tiếng Việt, ngắn gọn, mang tính xây dựng.',
    '',
    `Đề bài: ${input.prompt}`,
  );

  if (input.passage) {
    lines.push(`Ngữ cảnh / đoạn cho trước:\n${input.passage}`);
  }
  if (input.minChars != null || input.maxChars != null) {
    const range =
      input.minChars != null && input.maxChars != null
        ? `${input.minChars}–${input.maxChars} ký tự`
        : input.minChars != null
          ? `tối thiểu ${input.minChars} ký tự`
          : `tối đa ${input.maxChars} ký tự`;
    lines.push(`Yêu cầu độ dài: ${range}.`);
  }
  if (input.rubric != null) {
    lines.push(`Tiêu chí chấm (rubric): ${JSON.stringify(input.rubric)}`);
  }

  if (input.parts && input.parts.length > 0) {
    lines.push('', 'Bài viết gồm nhiều ý nhỏ, chấm điểm từng ý:');
    for (const part of input.parts) {
      lines.push(
        `- Ý ${part.label} (tối đa ${part.maxScore ?? 5} điểm):`,
        `  Đáp án mẫu: ${part.modelAnswer ?? '(không có)'}`,
        `  Bài làm: ${part.textAnswer || '(bỏ trống)'}`,
      );
    }
    lines.push(
      '',
      'Chỉ trả về JSON đúng định dạng sau, không kèm giải thích ngoài JSON:',
      '{',
      '  "parts": [',
      '    { "label": "<nhãn ý>", "score": <số điểm>, "feedback": "<nhận xét tiếng Việt>" }',
      '  ],',
      '  "feedback": "<nhận xét chung tiếng Việt>"',
      '}',
    );
    return lines.join('\n');
  }

  const max = input.maxScore ?? (input.questionType === TopikQuestionType.ESSAY ? 50 : 10);
  lines.push(
    '',
    `Đáp án mẫu (tham khảo): ${input.modelAnswer ?? '(không có)'}`,
    `Bài làm của thí sinh:\n${input.textAnswer || '(bỏ trống)'}`,
    '',
    `Chấm trên thang tối đa ${max} điểm.`,
    'Chỉ trả về JSON đúng định dạng sau, không kèm giải thích ngoài JSON:',
    '{',
    `  "score": <số điểm, 0–${max}>,`,
    '  "feedback": "<nhận xét tiếng Việt>"',
    '}',
  );
  return lines.join('\n');
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : trimmed;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('AI response không chứa JSON hợp lệ');
  }
  return JSON.parse(body.slice(start, end + 1));
}

/** Parse phản hồi Gemini thành điểm + nhận xét, có clamp theo maxScore. */
export function parseWritingGradingResponse(
  text: string,
  input: WritingGradingInput,
): WritingGradingResult {
  const data = extractJson(text) as Record<string, unknown>;

  if (input.parts && input.parts.length > 0) {
    const rawParts = Array.isArray(data.parts) ? data.parts : [];
    const parts: WritingGradingPartResult[] = input.parts.map((part, i) => {
      const match =
        (rawParts.find(
          (p) =>
            typeof p === 'object' &&
            p !== null &&
            (p as { label?: unknown }).label === part.label,
        ) as Record<string, unknown> | undefined) ??
        (rawParts[i] as Record<string, unknown> | undefined);
      return {
        label: part.label,
        score: clampScore(match?.score, part.maxScore),
        feedback:
          typeof match?.feedback === 'string' ? match.feedback : '',
      };
    });
    const total = parts.reduce((sum, p) => sum + p.score, 0);
    return {
      score: Math.round(total * 10) / 10,
      feedback: typeof data.feedback === 'string' ? data.feedback : '',
      parts,
    };
  }

  return {
    score: clampScore(data.score, input.maxScore),
    feedback: typeof data.feedback === 'string' ? data.feedback : '',
  };
}
