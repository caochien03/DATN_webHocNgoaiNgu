import { SpeakingSelfLevel } from '@prisma/client';

export type SpeakingGoal = {
  key: string;
  labelVi: string;
  required: boolean;
};

export type SpeakingTurnHistoryItem = {
  speaker: 'USER' | 'NPC';
  text: string;
};

export type SpeakingTurnGrading = {
  task: number;
  grammar: number;
  vocabulary: number;
  coherence: number;
  score: number;
  feedback: string;
  sampleImprovement?: string;
};

export type SpeakingTurnInput = {
  situationTitle: string;
  contextVi: string;
  userRoleVi: string;
  npcRoleVi: string;
  systemPrompt: string;
  goals: SpeakingGoal[];
  filledGoals: Record<string, string>;
  maxUserTurns: number;
  /** Số lượt user đã nói, bao gồm lượt hiện tại. */
  userTurnCount: number;
  transcript: string;
  history: SpeakingTurnHistoryItem[];
};

export type SpeakingTurnResult = {
  goalUpdates: Record<string, string>;
  filledGoals: Record<string, string>;
  npcReply: string;
  grading: SpeakingTurnGrading;
  allRequiredGoalsMet: boolean;
  shouldEnd: boolean;
};

export type SpeakingSessionTurnSummary = {
  orderIndex: number;
  transcript: string;
  grading: SpeakingTurnGrading;
};

export type SpeakingSessionSummaryInput = {
  situationTitle: string;
  selfLevel: SpeakingSelfLevel;
  goals: SpeakingGoal[];
  filledGoals: Record<string, string>;
  turns: SpeakingSessionTurnSummary[];
};

export type SpeakingSessionSummaryResult = {
  overallScore: number;
  estimatedLevel: string;
  summaryFeedback: string;
  goalsCompleted: number;
  goalsTotal: number;
};

const SELF_LEVEL_LABEL: Record<SpeakingSelfLevel, string> = {
  BEGINNER: 'Sơ cấp',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Khá / nâng cao',
};

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.round(Math.min(max, Math.max(min, n)));
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

export function parseSpeakingGoals(raw: unknown): SpeakingGoal[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null,
    )
    .map((item) => ({
      key: typeof item.key === 'string' ? item.key : '',
      labelVi: typeof item.labelVi === 'string' ? item.labelVi : '',
      required: item.required === true,
    }))
    .filter((g) => g.key.length > 0);
}

export function mergeGoalUpdates(
  filledGoals: Record<string, string>,
  goalUpdates: Record<string, string>,
): Record<string, string> {
  const merged = { ...filledGoals };
  for (const [key, value] of Object.entries(goalUpdates)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      merged[key] = value.trim();
    }
  }
  return merged;
}

export function countRequiredGoals(
  goals: SpeakingGoal[],
  filledGoals: Record<string, string>,
): { completed: number; total: number; allRequiredMet: boolean } {
  const required = goals.filter((g) => g.required);
  const completed = required.filter((g) => {
    const value = filledGoals[g.key];
    return typeof value === 'string' && value.trim().length > 0;
  }).length;
  return {
    completed,
    total: required.length,
    allRequiredMet: required.length === 0 || completed === required.length,
  };
}

function formatGoalsForPrompt(
  goals: SpeakingGoal[],
  filledGoals: Record<string, string>,
): string {
  return goals
    .map((g) => {
      const filled = filledGoals[g.key];
      const status =
        typeof filled === 'string' && filled.trim().length > 0
          ? `đã có: "${filled.trim()}"`
          : 'chưa có';
      return `- ${g.key} (${g.labelVi}, ${g.required ? 'bắt buộc' : 'tuỳ chọn'}): ${status}`;
    })
    .join('\n');
}

function formatHistory(history: SpeakingTurnHistoryItem[]): string {
  if (history.length === 0) return '(chưa có)';
  return history
    .map((h) => `[${h.speaker}] ${h.text}`)
    .join('\n');
}

/** Prompt xử lý một lượt user: cập nhật mục tiêu, chấm điểm, sinh câu NPC. */
export function buildSpeakingTurnPrompt(input: SpeakingTurnInput): string {
  const goalStatus = formatGoalsForPrompt(input.goals, input.filledGoals);
  const historyText = formatHistory(input.history);

  return [
    'Bạn là engine xử lý luyện nói tiếng Hàn theo tình huống giao tiếp.',
    'Nhiệm vụ: (1) trích xuất thông tin mới từ câu user, (2) chấm lượt nói, (3) sinh câu NPC tiếp theo.',
    '',
    '=== Tình huống ===',
    `Tiêu đề: ${input.situationTitle}`,
    `Bối cảnh: ${input.contextVi}`,
    `Vai user: ${input.userRoleVi}`,
    `Vai NPC: ${input.npcRoleVi}`,
    '',
    '=== Hướng dẫn vai NPC ===',
    input.systemPrompt,
    '',
    '=== Mục tiêu giao tiếp ===',
    goalStatus,
    '',
    '=== Lịch sử hội thoại ===',
    historyText,
    '',
    '=== Lượt user vừa nói (STT) ===',
    input.transcript.trim() || '(trống / không nghe rõ)',
    '',
    `Lượt user: ${input.userTurnCount}/${input.maxUserTurns}`,
    '',
    'Quy tắc:',
    '- goalUpdates chỉ gồm key hợp lệ trong danh sách mục tiêu; giá trị là chuỗi tiếng Hàn hoặc mô tả ngắn.',
    '- Không hỏi lại thông tin đã có trong mục tiêu.',
    '- npcReply: 1–2 câu tiếng Hàn, đúng vai NPC.',
    '- Chấm theo rubric 0–5 (task, grammar, vocabulary, coherence); score tổng 0–100.',
    '- feedback và sampleImprovement: tiếng Việt, ngắn gọn.',
    '- allRequiredGoalsMet: true khi mọi mục tiêu bắt buộc đã đủ thông tin.',
    '- shouldEnd: true khi đủ mục tiêu bắt buộc và đã xác nhận, hoặc không còn gì cần hỏi.',
    '',
    'Chỉ trả về JSON đúng định dạng sau, không kèm giải thích ngoài JSON:',
    '{',
    '  "goalUpdates": { "<goal_key>": "<giá trị>" },',
    '  "npcReply": "<câu NPC tiếng Hàn>",',
    '  "grading": {',
    '    "task": <0-5>,',
    '    "grammar": <0-5>,',
    '    "vocabulary": <0-5>,',
    '    "coherence": <0-5>,',
    '    "score": <0-100>,',
    '    "feedback": "<nhận xét tiếng Việt>",',
    '    "sampleImprovement": "<câu Hàn gợi ý, tuỳ chọn>"',
    '  },',
    '  "allRequiredGoalsMet": <boolean>,',
    '  "shouldEnd": <boolean>',
    '}',
  ].join('\n');
}

function parseGoalUpdates(
  raw: unknown,
  allowedKeys: Set<string>,
): Record<string, string> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {};
  }
  const updates: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!allowedKeys.has(key)) continue;
    if (typeof value === 'string' && value.trim().length > 0) {
      updates[key] = value.trim();
    }
  }
  return updates;
}

function parseGrading(raw: unknown): SpeakingTurnGrading {
  const data =
    typeof raw === 'object' && raw !== null && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const task = clampInt(data.task, 0, 5);
  const grammar = clampInt(data.grammar, 0, 5);
  const vocabulary = clampInt(data.vocabulary, 0, 5);
  const coherence = clampInt(data.coherence, 0, 5);
  const avg = (task + grammar + vocabulary + coherence) / 4;
  const derivedScore = Math.round(avg * 20);

  return {
    task,
    grammar,
    vocabulary,
    coherence,
    score: clampInt(data.score ?? derivedScore, 0, 100),
    feedback: typeof data.feedback === 'string' ? data.feedback : '',
    sampleImprovement:
      typeof data.sampleImprovement === 'string' &&
      data.sampleImprovement.trim().length > 0
        ? data.sampleImprovement.trim()
        : undefined,
  };
}

/** Parse phản hồi Gemini cho một lượt user. */
export function parseSpeakingTurnResponse(
  text: string,
  input: SpeakingTurnInput,
): SpeakingTurnResult {
  const data = extractJson(text) as Record<string, unknown>;
  const allowedKeys = new Set([
    ...input.goals.map((g) => g.key),
    ...Object.keys(input.filledGoals),
  ]);

  const goalUpdates = parseGoalUpdates(data.goalUpdates, allowedKeys);
  const filledGoals = mergeGoalUpdates(input.filledGoals, goalUpdates);
  const { allRequiredMet } = countRequiredGoals(input.goals, filledGoals);

  const npcReply =
    typeof data.npcReply === 'string' ? data.npcReply.trim() : '';
  if (!npcReply) {
    throw new Error('AI response thiếu npcReply');
  }

  const atMaxTurns = input.userTurnCount >= input.maxUserTurns;
  const shouldEndFromAi = data.shouldEnd === true;

  return {
    goalUpdates,
    filledGoals,
    npcReply,
    grading: parseGrading(data.grading),
    allRequiredGoalsMet: allRequiredMet,
    shouldEnd: shouldEndFromAi || allRequiredMet || atMaxTurns,
  };
}

/** Prompt tổng kết cuối phiên luyện nói. */
export function buildSpeakingSessionSummaryPrompt(
  input: SpeakingSessionSummaryInput,
): string {
  const goalStatus = formatGoalsForPrompt(input.goals, input.filledGoals);
  const { completed, total } = countRequiredGoals(
    input.goals,
    input.filledGoals,
  );

  const turnLines = input.turns
    .map((t) => {
      const g = t.grading;
      return [
        `Lượt ${t.orderIndex}:`,
        `  Transcript: ${t.transcript}`,
        `  Điểm: ${g.score} (task ${g.task}, grammar ${g.grammar}, vocabulary ${g.vocabulary}, coherence ${g.coherence})`,
        `  Nhận xét: ${g.feedback || '(không có)'}`,
      ].join('\n');
    })
    .join('\n\n');

  return [
    'Bạn là giám khảo tổng kết phiên luyện nói tiếng Hàn.',
    'Hãy đánh giá toàn phiên và trả về JSON.',
    '',
    `Tình huống: ${input.situationTitle}`,
    `Trình độ tự đánh giá của học viên: ${SELF_LEVEL_LABEL[input.selfLevel]}`,
    '',
    '=== Mục tiêu ===',
    goalStatus,
    `Hoàn thành mục tiêu bắt buộc: ${completed}/${total}`,
    '',
    '=== Các lượt user ===',
    turnLines || '(không có)',
    '',
    'Quy tắc:',
    '- overallScore: 0–100.',
    '- estimatedLevel: một trong "Sơ cấp", "Trung bình", "Khá".',
    '- summaryFeedback: tiếng Việt, 3–5 câu, nêu điểm mạnh và cần cải thiện.',
    '- goalsCompleted / goalsTotal: số mục tiêu bắt buộc đã đạt / tổng bắt buộc.',
    '',
    'Chỉ trả về JSON:',
    '{',
    '  "overallScore": <0-100>,',
    '  "estimatedLevel": "<Sơ cấp|Trung bình|Khá>",',
    '  "summaryFeedback": "<tiếng Việt>",',
    '  "goalsCompleted": <number>,',
    '  "goalsTotal": <number>',
    '}',
  ].join('\n');
}

const VALID_ESTIMATED_LEVELS = new Set(['Sơ cấp', 'Trung bình', 'Khá']);

/** Parse phản hồi tổng kết phiên. */
export function parseSpeakingSessionSummaryResponse(
  text: string,
  input: SpeakingSessionSummaryInput,
): SpeakingSessionSummaryResult {
  const data = extractJson(text) as Record<string, unknown>;
  const counts = countRequiredGoals(input.goals, input.filledGoals);

  const estimatedLevelRaw =
    typeof data.estimatedLevel === 'string' ? data.estimatedLevel.trim() : '';
  const estimatedLevel = VALID_ESTIMATED_LEVELS.has(estimatedLevelRaw)
    ? estimatedLevelRaw
    : 'Trung bình';

  return {
    overallScore: clampInt(data.overallScore, 0, 100),
    estimatedLevel,
    summaryFeedback:
      typeof data.summaryFeedback === 'string' ? data.summaryFeedback : '',
    goalsCompleted: clampInt(
      data.goalsCompleted ?? counts.completed,
      0,
      counts.total,
    ),
    goalsTotal: clampInt(data.goalsTotal ?? counts.total, 0, counts.total || 99),
  };
}
