import { SpeakingSelfLevel } from '@prisma/client';
import {
  buildSpeakingAudioTurnPrompt,
  buildSpeakingSessionSummaryPrompt,
  countRequiredGoals,
  mergeGoalUpdates,
  parseSpeakingAudioTurnResponse,
  parseSpeakingGoals,
  parseSpeakingSessionSummaryResponse,
  type SpeakingGoal,
  type SpeakingTurnContext,
} from './speaking-ai';

describe('speaking-ai', () => {
  const goals: SpeakingGoal[] = [
    { key: 'party_size', labelVi: 'Số người', required: true },
    { key: 'date_time', labelVi: 'Ngày giờ', required: true },
    { key: 'name', labelVi: 'Tên', required: true },
    {
      key: 'special_request',
      labelVi: 'Yêu cầu đặc biệt',
      required: false,
    },
  ];

  const turnContext: SpeakingTurnContext = {
    situationTitle: 'Đặt bàn nhà hàng',
    contextVi: 'Bạn đặt bàn buổi tối.',
    userRoleVi: 'Khách hàng',
    npcRoleVi: 'Nhân viên nhà hàng',
    systemPrompt: 'Chỉ nói tiếng Hàn, ngắn gọn.',
    goals,
    filledGoals: {},
    maxUserTurns: 5,
    userTurnCount: 1,
    history: [{ speaker: 'NPC', text: '몇 분이세요?' }],
  };

  it('parseSpeakingGoals filters invalid entries', () => {
    const parsed = parseSpeakingGoals([
      { key: 'party_size', labelVi: 'Số người', required: true },
      { key: '', labelVi: 'x', required: false },
      null,
    ]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].key).toBe('party_size');
  });

  it('buildSpeakingAudioTurnPrompt includes situation and goals', () => {
    const prompt = buildSpeakingAudioTurnPrompt(turnContext);
    expect(prompt).toContain('Đặt bàn nhà hàng');
    expect(prompt).toContain('party_size');
    expect(prompt).toContain('transcript');
    expect(prompt).not.toContain('grading');
  });

  it('parseSpeakingAudioTurnResponse merges goals', () => {
    const result = parseSpeakingAudioTurnResponse(
      JSON.stringify({
        transcript: '네 명이에요',
        goalUpdates: { party_size: '4명', unknown: 'skip' },
        npcReply: '언제 오실 예정이세요?',
        allRequiredGoalsMet: false,
        shouldEnd: false,
      }),
      turnContext,
    );

    expect(result.transcript).toBe('네 명이에요');
    expect(result.filledGoals.party_size).toBe('4명');
    expect(result.filledGoals.unknown).toBeUndefined();
    expect(result.npcReply).toBe('언제 오실 예정이세요?');
    expect(result.allRequiredGoalsMet).toBe(false);
    expect(result.shouldEnd).toBe(false);
  });

  it('parseSpeakingAudioTurnResponse ends when all required goals met', () => {
    const result = parseSpeakingAudioTurnResponse(
      JSON.stringify({
        transcript: '내일 7시에 김민수예요',
        goalUpdates: {
          party_size: '4',
          date_time: '내일 7시',
          name: '김민수',
        },
        npcReply: '예약 확인되었습니다.',
        allRequiredGoalsMet: true,
        shouldEnd: true,
      }),
      {
        ...turnContext,
        userTurnCount: 3,
        filledGoals: { party_size: '4' },
      },
    );

    expect(result.allRequiredGoalsMet).toBe(true);
    expect(result.shouldEnd).toBe(true);
  });

  it('parseSpeakingAudioTurnResponse ends at max user turns', () => {
    const result = parseSpeakingAudioTurnResponse(
      JSON.stringify({
        transcript: '네',
        goalUpdates: {},
        npcReply: '알겠습니다.',
        shouldEnd: false,
      }),
      { ...turnContext, userTurnCount: 5 },
    );

    expect(result.shouldEnd).toBe(true);
  });

  it('throws when transcript or npcReply missing', () => {
    expect(() =>
      parseSpeakingAudioTurnResponse(
        JSON.stringify({ goalUpdates: {}, npcReply: '안녕' }),
        turnContext,
      ),
    ).toThrow(/transcript/);

    expect(() =>
      parseSpeakingAudioTurnResponse(
        JSON.stringify({ transcript: '네', goalUpdates: {} }),
        turnContext,
      ),
    ).toThrow(/npcReply/);
  });

  it('countRequiredGoals counts only required keys with values', () => {
    const counts = countRequiredGoals(goals, {
      party_size: '4',
      date_time: '',
      special_request: '창가',
    });
    expect(counts.completed).toBe(1);
    expect(counts.total).toBe(3);
    expect(counts.allRequiredMet).toBe(false);
  });

  it('mergeGoalUpdates overwrites existing keys', () => {
    const merged = mergeGoalUpdates(
      { party_size: '3' },
      { party_size: '6명', date_time: '내일' },
    );
    expect(merged).toEqual({ party_size: '6명', date_time: '내일' });
  });

  describe('session summary', () => {
    const summaryInput = {
      situationTitle: 'Đặt bàn nhà hàng',
      selfLevel: SpeakingSelfLevel.INTERMEDIATE,
      goals,
      filledGoals: {
        party_size: '4',
        date_time: '내일 7시',
        name: '김민수',
      },
      turns: [
        {
          orderIndex: 1,
          transcript: '네 명이에요',
        },
      ],
    };

    it('buildSpeakingSessionSummaryPrompt includes turns and level', () => {
      const prompt = buildSpeakingSessionSummaryPrompt(summaryInput);
      expect(prompt).toContain('Trung cấp');
      expect(prompt).toContain('네 명이에요');
      expect(prompt).toContain('turnGradings');
    });

    it('parseSpeakingSessionSummaryResponse clamps score and parses turn gradings', () => {
      const result = parseSpeakingSessionSummaryResponse(
        JSON.stringify({
          overallScore: 120,
          estimatedLevel: 'Invalid',
          summaryFeedback: 'Tốt lắm',
          goalsCompleted: 3,
          goalsTotal: 3,
          turnGradings: [
            {
              orderIndex: 1,
              grading: {
                task: 6,
                grammar: 4,
                vocabulary: 3,
                coherence: 4,
                score: 150,
                feedback: 'Ổn',
              },
            },
          ],
        }),
        summaryInput,
      );

      expect(result.overallScore).toBe(100);
      expect(result.estimatedLevel).toBe('Trung bình');
      expect(result.summaryFeedback).toBe('Tốt lắm');
      expect(result.goalsCompleted).toBe(3);
      expect(result.goalsTotal).toBe(3);
      expect(result.turnGradings).toHaveLength(1);
      expect(result.turnGradings[0].orderIndex).toBe(1);
      expect(result.turnGradings[0].grading.task).toBe(5);
      expect(result.turnGradings[0].grading.score).toBe(100);
    });

    it('fills missing turn gradings with defaults', () => {
      const result = parseSpeakingSessionSummaryResponse(
        JSON.stringify({
          overallScore: 70,
          estimatedLevel: 'Khá',
          summaryFeedback: 'OK',
          goalsCompleted: 3,
          goalsTotal: 3,
        }),
        summaryInput,
      );

      expect(result.turnGradings).toHaveLength(1);
      expect(result.turnGradings[0].grading.score).toBe(0);
    });
  });
});
