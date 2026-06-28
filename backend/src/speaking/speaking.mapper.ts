import {
  SpeakingSession,
  SpeakingSituation,
  SpeakingTopic,
  SpeakingTurn,
} from '@prisma/client';
import {
  countRequiredGoals,
  parseSpeakingGoals,
  type SpeakingGoal,
  type SpeakingTurnGrading,
} from './speaking-ai';

type SituationWithTopic = SpeakingSituation & {
  topic: Pick<SpeakingTopic, 'id' | 'title' | 'titleKo'> | null;
};

export type SpeakingGoalStatus = SpeakingGoal & {
  filled?: string;
  completed: boolean;
};

export function mapGoalStatuses(
  goalsRaw: unknown,
  filledGoals: Record<string, string>,
): SpeakingGoalStatus[] {
  return parseSpeakingGoals(goalsRaw).map((g) => {
    const filled = filledGoals[g.key];
    const completed = typeof filled === 'string' && filled.trim().length > 0;
    return {
      ...g,
      filled: completed ? filled : undefined,
      completed,
    };
  });
}

export function mapSituationSummary(
  situation: SituationWithTopic,
  filledGoals: Record<string, string> = {},
) {
  const goals = mapGoalStatuses(situation.goals, filledGoals);
  const { completed, total } = countRequiredGoals(
    parseSpeakingGoals(situation.goals),
    filledGoals,
  );

  return {
    id: situation.id,
    title: situation.title,
    contextVi: situation.contextVi,
    level: situation.level,
    userRoleVi: situation.userRoleVi,
    npcRoleVi: situation.npcRoleVi,
    maxUserTurns: situation.maxUserTurns,
    topic: situation.topic
      ? {
          id: situation.topic.id,
          title: situation.topic.title,
          titleKo: situation.topic.titleKo,
        }
      : null,
    goals,
    goalsCompleted: completed,
    goalsTotal: total,
  };
}

export function mapTurn(turn: SpeakingTurn) {
  return {
    id: turn.id,
    orderIndex: turn.orderIndex,
    speaker: turn.speaker,
    text: turn.text,
    grading: (turn.grading as SpeakingTurnGrading | null) ?? null,
    durationSecs: turn.durationSecs,
    createdAt: turn.createdAt.toISOString(),
  };
}

export function mapSessionDetail(
  session: SpeakingSession & {
    situation: SituationWithTopic;
    turns: SpeakingTurn[];
  },
) {
  const filledGoals = (session.filledGoals ?? {}) as Record<string, string>;

  return {
    id: session.id,
    status: session.status,
    selfLevel: session.selfLevel,
    selectedTopicIds: session.selectedTopicIds,
    filledGoals,
    overallScore: session.overallScore,
    estimatedLevel: session.estimatedLevel,
    summaryFeedback: session.summaryFeedback,
    goalsCompleted: session.goalsCompleted,
    goalsTotal: session.goalsTotal,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    situation: mapSituationSummary(session.situation, filledGoals),
    turns: session.turns.map(mapTurn),
    userTurnCount: session.turns.filter((t) => t.speaker === 'USER').length,
  };
}

export function mapSessionListItem(
  session: SpeakingSession & {
    situation: Pick<SpeakingSituation, 'id' | 'title' | 'level'>;
  },
) {
  return {
    id: session.id,
    status: session.status,
    selfLevel: session.selfLevel,
    overallScore: session.overallScore,
    estimatedLevel: session.estimatedLevel,
    goalsCompleted: session.goalsCompleted,
    goalsTotal: session.goalsTotal,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    situation: {
      id: session.situation.id,
      title: session.situation.title,
      level: session.situation.level,
    },
  };
}
