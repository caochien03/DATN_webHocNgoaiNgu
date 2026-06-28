import { SpeakingSelfLevel } from '@prisma/client';
import {
  buildSpeakingSessionSummaryPrompt,
  buildSpeakingTurnPrompt,
  countRequiredGoals,
  mergeGoalUpdates,
  parseSpeakingGoals,
  parseSpeakingSessionSummaryResponse,
  parseSpeakingTurnResponse,
  type SpeakingGoal,
  type SpeakingTurnInput,
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

  const turnInput: SpeakingTurnInput = {
    situationTitle: 'Đặt bàn nhà hàng',
    contextVi: 'Bạn đặt bàn buổi tối.',
    userRoleVi: 'Khách hàng',
    npcRoleVi: 'Nhân viên nhà hàng',
    systemPrompt: 'Chỉ nói tiếng Hàn, ngắn gọn.',
    goals,
    filledGoals: {},
    maxUserTurns: 5,
    userTurnCount: 1,
    transcript: '네 명이에요',
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

  it('buildSpeakingTurnPrompt includes situation and transcript', () => {
    const prompt = buildSpeakingTurnPrompt(turnInput);
    expect(prompt).toContain('Đặt bàn nhà hàng');
    expect(prompt).toContain('네 명이에요');
    expect(prompt).toContain('party_size');
    expect(prompt).toContain('goalUpdates');
  });

  it('parseSpeakingTurnResponse merges goals and clamps grading', () => {
    const result = parseSpeakingTurnResponse(
      JSON.stringify({
        goalUpdates: { party_size: '4명', unknown: 'skip' },
        npcReply: '언제 오실 예정이세요?',
        grading: {
          task: 6,
          grammar: 4,
          vocabulary: 3,
          coherence: 4,
          score: 150,
          feedback: 'Tốt',
        },
        allRequiredGoalsMet: false,
        shouldEnd: false,
      }),
      turnInput,
    );

    expect(result.filledGoals.party_size).toBe('4명');
    expect(result.filledGoals.unknown).toBeUndefined();
    expect(result.npcReply).toBe('언제 오실 예정이세요?');
    expect(result.grading.task).toBe(5);
    expect(result.grading.score).toBe(100);
    expect(result.grading.feedback).toBe('Tốt');
    expect(result.allRequiredGoalsMet).toBe(false);
    expect(result.shouldEnd).toBe(false);
  });

  it('parseSpeakingTurnResponse ends when all required goals met', () => {
    const result = parseSpeakingTurnResponse(
      JSON.stringify({
        goalUpdates: {
          party_size: '4',
          date_time: '내일 7시',
          name: '김민수',
        },
        npcReply: '예약 확인되었습니다.',
        grading: {
          task: 5,
          grammar: 5,
          vocabulary: 5,
          coherence: 5,
          score: 95,
          feedback: 'Hoàn thành',
        },
        allRequiredGoalsMet: true,
        shouldEnd: true,
      }),
      {
        ...turnInput,
        userTurnCount: 3,
        filledGoals: { party_size: '4' },
      },
    );

    expect(result.allRequiredGoalsMet).toBe(true);
    expect(result.shouldEnd).toBe(true);
  });

  it('parseSpeakingTurnResponse ends at max user turns', () => {
    const result = parseSpeakingTurnResponse(
      JSON.stringify({
        goalUpdates: {},
        npcReply: '알겠습니다.',
        grading: {
          task: 2,
          grammar: 2,
          vocabulary: 2,
          coherence: 2,
          score: 40,
          feedback: 'Cần cải thiện',
        },
        shouldEnd: false,
      }),
      { ...turnInput, userTurnCount: 5 },
    );

    expect(result.shouldEnd).toBe(true);
  });

  it('throws when npcReply missing', () => {
    expect(() =>
      parseSpeakingTurnResponse(
        JSON.stringify({ goalUpdates: {}, grading: {} }),
        turnInput,
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
          grading: {
            task: 4,
            grammar: 3,
            vocabulary: 4,
            coherence: 4,
            score: 75,
            feedback: 'Ổn',
          },
        },
      ],
    };

    it('buildSpeakingSessionSummaryPrompt includes turns and level', () => {
      const prompt = buildSpeakingSessionSummaryPrompt(summaryInput);
      expect(prompt).toContain('Trung cấp');
      expect(prompt).toContain('네 명이에요');
      expect(prompt).toContain('estimatedLevel');
    });

    it('parseSpeakingSessionSummaryResponse clamps score and validates level', () => {
      const result = parseSpeakingSessionSummaryResponse(
        JSON.stringify({
          overallScore: 120,
          estimatedLevel: 'Invalid',
          summaryFeedback: 'Tốt lắm',
          goalsCompleted: 3,
          goalsTotal: 3,
        }),
        summaryInput,
      );

      expect(result.overallScore).toBe(100);
      expect(result.estimatedLevel).toBe('Trung bình');
      expect(result.summaryFeedback).toBe('Tốt lắm');
      expect(result.goalsCompleted).toBe(3);
      expect(result.goalsTotal).toBe(3);
    });
  });
});
