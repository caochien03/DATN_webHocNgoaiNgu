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

/** Ngôn ngữ đích của phiên luyện nói (`ko`, `en`, …). */
export type SpeakingTargetLanguage = 'ko' | 'en' | (string & {});

const TARGET_LANGUAGE_META: Record<
  string,
  { label: string; script: string; sampleLabel: string }
> = {
  ko: {
    label: 'tiếng Hàn',
    script: 'Hangul',
    sampleLabel: 'câu Hàn',
  },
  en: {
    label: 'tiếng Anh',
    script: 'chữ Latin',
    sampleLabel: 'câu Anh',
  },
};

function targetLanguageMeta(code?: string) {
  return TARGET_LANGUAGE_META[code ?? 'ko'] ?? TARGET_LANGUAGE_META.ko;
}

/** Ngữ cảnh xử lý một lượt (không gồm transcript — audio hoặc text riêng). */
export type SpeakingTurnContext = {
  targetLanguage: SpeakingTargetLanguage;
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
  history: SpeakingTurnHistoryItem[];
};

/** Kết quả xử lý audio một lượt — không chấm điểm (chấm cuối phiên). */
export type SpeakingAudioTurnResult = {
  transcript: string;
  goalUpdates: Record<string, string>;
  filledGoals: Record<string, string>;
  npcReply: string;
  allRequiredGoalsMet: boolean;
  shouldEnd: boolean;
};

export type SpeakingSessionTurnSummary = {
  orderIndex: number;
  transcript: string;
};

export type SpeakingSessionSummaryInput = {
  targetLanguage: SpeakingTargetLanguage;
  situationTitle: string;
  selfLevel: SpeakingSelfLevel;
  goals: SpeakingGoal[];
  filledGoals: Record<string, string>;
  turns: SpeakingSessionTurnSummary[];
};

export type SpeakingTurnGradingResult = {
  orderIndex: number;
  grading: SpeakingTurnGrading;
};

export type SpeakingSessionSummaryResult = {
  overallScore: number;
  estimatedLevel: string;
  summaryFeedback: string;
  goalsCompleted: number;
  goalsTotal: number;
  turnGradings: SpeakingTurnGradingResult[];
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
  return history.map((h) => `[${h.speaker}] ${h.text}`).join('\n');
}

/**
 * Prompt xử lý text một lượt (transcript đã có từ Whisper).
 * Gemini chỉ cần: trích xuất goalUpdates + sinh câu NPC.
 */
export function buildSpeakingTextTurnPrompt(
  ctx: SpeakingTurnContext,
  transcript: string,
): string {
  const goalStatus = formatGoalsForPrompt(ctx.goals, ctx.filledGoals);
  const historyText = formatHistory(ctx.history);
  const lang = targetLanguageMeta(ctx.targetLanguage);

  return [
    `Bạn là engine xử lý luyện nói ${lang.label} theo tình huống giao tiếp.`,
    `Người học vừa nói: "${transcript}"`,
    'Nhiệm vụ:',
    '(1) Trích xuất thông tin mới vào goalUpdates.',
    '(2) Sinh câu NPC tiếp theo.',
    'KHÔNG chấm điểm hay nhận xét — chỉ xử lý hội thoại.',
    '',
    'LƯU Ý VỀ TỰ SỬA LỖI (SELF-REPAIR):',
    '- Người nói rất thường tự sửa giữa chừng (ví dụ: "사과 주세요... 아, 컴퓨터 주세요").',
    '- Khi gặp tự sửa, hãy lấy ý định cuối cùng của học viên (phần sau khi sửa) để trích xuất goalUpdates.',
    '- NPC nên phản hồi dựa trên ý định đã được sửa, không nên nhắc lại lỗi cũ.',
    '',
    '=== Tình huống ===',
    `Tiêu đề: ${ctx.situationTitle}`,
    `Bối cảnh: ${ctx.contextVi}`,
    `Vai user: ${ctx.userRoleVi}`,
    `Vai NPC: ${ctx.npcRoleVi}`,
    '',
    '=== Hướng dẫn vai NPC ===',
    ctx.systemPrompt,
    '',
    '=== Mục tiêu giao tiếp ===',
    goalStatus,
    '',
    '=== Lịch sử hội thoại ===',
    historyText,
    '',
    `Lượt user: ${ctx.userTurnCount}/${ctx.maxUserTurns}`,
    '',
    'Quy tắc:',
    `- goalUpdates chỉ gồm key hợp lệ; giá trị ${lang.label} hoặc mô tả ngắn.`,
    '- Không hỏi lại thông tin đã có trong mục tiêu.',
    `- npcReply: 1–2 câu ${lang.label}, đúng vai NPC.`,
    '- allRequiredGoalsMet: true khi mọi mục tiêu bắt buộc đã đủ.',
    '- shouldEnd: true khi đủ mục tiêu bắt buộc và đã xác nhận, hoặc không còn gì cần hỏi.',
    '',
    'Chỉ trả về JSON:',
    '{',
    '  "goalUpdates": { "<goal_key>": "<giá trị>" },',
    `  "npcReply": "<câu NPC ${lang.label}>",`,
    '  "allRequiredGoalsMet": <boolean>,',
    '  "shouldEnd": <boolean>',
    '}',
  ].join('\n');
}

/** Prompt xử lý audio một lượt: STT + mục tiêu + NPC (không chấm điểm). Dùng khi không có Whisper. */
export function buildSpeakingAudioTurnPrompt(ctx: SpeakingTurnContext): string {
  const goalStatus = formatGoalsForPrompt(ctx.goals, ctx.filledGoals);
  const historyText = formatHistory(ctx.history);
  const lang = targetLanguageMeta(ctx.targetLanguage);

  return [
    `Bạn là engine xử lý luyện nói ${lang.label} theo tình huống giao tiếp.`,
    `Người học vừa gửi một đoạn audio (${lang.label}). Nhiệm vụ:`,
    `(1) Chuyển audio thành transcript ${lang.label} (${lang.script}).`,
    '(2) Trích xuất thông tin mới vào goalUpdates.',
    '(3) Sinh câu NPC tiếp theo.',
    'KHÔNG chấm điểm hay nhận xét — chỉ xử lý hội thoại.',
    '',
    '=== Tình huống ===',
    `Tiêu đề: ${ctx.situationTitle}`,
    `Bối cảnh: ${ctx.contextVi}`,
    `Vai user: ${ctx.userRoleVi}`,
    `Vai NPC: ${ctx.npcRoleVi}`,
    '',
    '=== Hướng dẫn vai NPC ===',
    ctx.systemPrompt,
    '',
    '=== Mục tiêu giao tiếp ===',
    goalStatus,
    '',
    '=== Lịch sử hội thoại ===',
    historyText,
    '',
    `Lượt user: ${ctx.userTurnCount}/${ctx.maxUserTurns}`,
    '',
    'Quy tắc:',
    `- transcript: chỉ nội dung ${lang.label} nghe được; nếu im lặng trả "".`,
    `- goalUpdates chỉ gồm key hợp lệ; giá trị ${lang.label} hoặc mô tả ngắn.`,
    '- Không hỏi lại thông tin đã có trong mục tiêu.',
    `- npcReply: 1–2 câu ${lang.label}, đúng vai NPC.`,
    '- allRequiredGoalsMet: true khi mọi mục tiêu bắt buộc đã đủ.',
    '- shouldEnd: true khi đủ mục tiêu bắt buộc và đã xác nhận, hoặc không còn gì cần hỏi.',
    '',
    'Chỉ trả về JSON:',
    '{',
    `  "transcript": "<${lang.label}>",`,
    '  "goalUpdates": { "<goal_key>": "<giá trị>" },',
    `  "npcReply": "<câu NPC ${lang.label}>",`,
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

/** Parse phản hồi Gemini cho một lượt audio (STT + NPC, không chấm). */
export function parseSpeakingAudioTurnResponse(
  text: string,
  ctx: SpeakingTurnContext,
): SpeakingAudioTurnResult {
  const data = extractJson(text) as Record<string, unknown>;
  const allowedKeys = new Set([
    ...ctx.goals.map((g) => g.key),
    ...Object.keys(ctx.filledGoals),
  ]);

  const transcript =
    typeof data.transcript === 'string' ? data.transcript.trim() : '';
  if (!transcript) {
    throw new Error('AI response thiếu transcript hoặc audio không rõ');
  }

  const goalUpdates = parseGoalUpdates(data.goalUpdates, allowedKeys);
  const filledGoals = mergeGoalUpdates(ctx.filledGoals, goalUpdates);
  const { allRequiredMet } = countRequiredGoals(ctx.goals, filledGoals);

  const npcReply =
    typeof data.npcReply === 'string' ? data.npcReply.trim() : '';
  if (!npcReply) {
    throw new Error('AI response thiếu npcReply');
  }

  const atMaxTurns = ctx.userTurnCount >= ctx.maxUserTurns;
  const shouldEndFromAi = data.shouldEnd === true;

  return {
    transcript,
    goalUpdates,
    filledGoals,
    npcReply,
    allRequiredGoalsMet: allRequiredMet,
    shouldEnd: shouldEndFromAi || allRequiredMet || atMaxTurns,
  };
}

/**
 * Parse phản hồi Gemini cho một lượt text (transcript từ Whisper đã có sẵn).
 * JSON response không có trường "transcript".
 */
export function parseSpeakingTextTurnResponse(
  text: string,
  ctx: SpeakingTurnContext,
  transcript: string,
): SpeakingAudioTurnResult {
  const data = extractJson(text) as Record<string, unknown>;
  const allowedKeys = new Set([
    ...ctx.goals.map((g) => g.key),
    ...Object.keys(ctx.filledGoals),
  ]);

  const goalUpdates = parseGoalUpdates(data.goalUpdates, allowedKeys);
  const filledGoals = mergeGoalUpdates(ctx.filledGoals, goalUpdates);
  const { allRequiredMet } = countRequiredGoals(ctx.goals, filledGoals);

  const npcReply =
    typeof data.npcReply === 'string' ? data.npcReply.trim() : '';
  if (!npcReply) {
    throw new Error('AI response thiếu npcReply');
  }

  const atMaxTurns = ctx.userTurnCount >= ctx.maxUserTurns;
  const shouldEndFromAi = data.shouldEnd === true;

  return {
    transcript,
    goalUpdates,
    filledGoals,
    npcReply,
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
  const lang = targetLanguageMeta(input.targetLanguage);

  const turnLines = input.turns
    .map(
      (t) => `Lượt orderIndex ${t.orderIndex}:\n  Transcript: ${t.transcript}`,
    )
    .join('\n\n');

  return [
    `Bạn là giám khảo tổng kết phiên luyện nói ${lang.label}.`,
    'Hãy chấm từng lượt user và tổng kết toàn phiên. Trả về JSON.',
    '',
    `Tình huống: ${input.situationTitle}`,
    `Trình độ tự đánh giá của học viên: ${SELF_LEVEL_LABEL[input.selfLevel]}`,
    '',
    '=== QUY TẮC ĐẶC BIỆT: TỰ SỬA LỖI TRONG KHI NÓI (SELF-REPAIR) ===',
    'Whisper ghi lại toàn bộ âm thanh kể cả vấp váp và tự sửa. Khi chấm điểm:',
    '- NẾU transcript chứa dấu hiệu tự sửa (ví dụ: "tôi... ý tôi muốn", "à không, là...", nói lại câu, ngập ngừng rồi sửa),',
    '  hãy chấm DỰA TRÊN Ý ĐỊNH CUỐI CÙNG — tức là phần sau khi học viên đã tự sửa.',
    '- KHÔNG phạt điểm grammar/vocabulary vì những lỗi đã được tự sửa.',
    '- Nếu học viên nhận ra và tự sửa lỗi ngữ pháp/từ vựng một cách chủ động, hãy GHI NHẬN TÍCH CỰC trong phần feedback.',
    '- CHỈ phạt điểm khi lỗi được lặp lại NHIỀU LẦN mà KHÔNG được tự sửa.',
    '- Phần "coherence" chỉ đánh giá mạch ý tổng thể; vấp váp ngắn không ảnh hưởng coherence.',
    '',
    '=== Mục tiêu ===',
    goalStatus,
    `Hoàn thành mục tiêu bắt buộc: ${completed}/${total}`,
    '',
    '=== Các lượt user (chưa chấm) ===',
    turnLines || '(không có)',
    '',
    'Quy tắc chấm từng lượt:',
    '- Rubric 0–5: task, grammar, vocabulary, coherence; score 0–100.',
    `- feedback tiếng Việt ngắn; sampleImprovement: ${lang.sampleLabel} gợi ý (tuỳ chọn).`,
    '- turnGradings phải có đủ mỗi orderIndex trong danh sách lượt.',
    '',
    'Quy tắc tổng kết:',
    '- overallScore: 0–100 (trung bình có trọng số hoặc tổng hợp toàn phiên).',
    '- estimatedLevel: "Sơ cấp" | "Trung bình" | "Khá".',
    '- summaryFeedback: tiếng Việt, 3–5 câu. Nếu học viên có thói quen tự sửa lỗi tốt, hãy đề cập điều này.',
    '',
    'Chỉ trả về JSON:',
    '{',
    '  "overallScore": <0-100>,',
    '  "estimatedLevel": "<Sơ cấp|Trung bình|Khá>",',
    '  "summaryFeedback": "<tiếng Việt>",',
    '  "goalsCompleted": <number>,',
    '  "goalsTotal": <number>,',
    '  "turnGradings": [',
    '    {',
    '      "orderIndex": <number>,',
    '      "grading": {',
    '        "task": <0-5>, "grammar": <0-5>, "vocabulary": <0-5>, "coherence": <0-5>,',
    '        "score": <0-100>, "feedback": "...", "sampleImprovement": "..."',
    '      }',
    '    }',
    '  ]',
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

  const expectedOrders = new Set(input.turns.map((t) => t.orderIndex));
  const rawGradings = Array.isArray(data.turnGradings) ? data.turnGradings : [];
  const turnGradings: SpeakingTurnGradingResult[] = [];

  for (const item of rawGradings) {
    if (typeof item !== 'object' || item === null) continue;
    const row = item as Record<string, unknown>;
    const orderIndex =
      typeof row.orderIndex === 'number'
        ? row.orderIndex
        : Number(row.orderIndex);
    if (!Number.isFinite(orderIndex) || !expectedOrders.has(orderIndex)) {
      continue;
    }
    turnGradings.push({
      orderIndex,
      grading: parseGrading(row.grading),
    });
  }

  for (const t of input.turns) {
    if (!turnGradings.some((g) => g.orderIndex === t.orderIndex)) {
      turnGradings.push({
        orderIndex: t.orderIndex,
        grading: {
          task: 0,
          grammar: 0,
          vocabulary: 0,
          coherence: 0,
          score: 0,
          feedback: '',
        },
      });
    }
  }

  turnGradings.sort((a, b) => a.orderIndex - b.orderIndex);

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
    goalsTotal: clampInt(
      data.goalsTotal ?? counts.total,
      0,
      counts.total || 99,
    ),
    turnGradings,
  };
}
