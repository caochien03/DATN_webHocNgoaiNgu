import { Prisma } from '@prisma/client';

export const LESSON_LIST_ORDER: Prisma.GrammarLessonOrderByWithRelationInput[] = [
  { level: 'asc' },
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

export const LESSON_LIST_COUNTS_INCLUDE = {
  _count: { select: { vocabulary: true, points: true, exercises: true } },
} satisfies Prisma.GrammarLessonInclude;

const VOCAB_ORDER: Prisma.LessonVocabularyOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

const POINTS_ORDER: Prisma.GrammarPointOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

export const EXERCISE_LIST_ORDER: Prisma.GrammarExerciseOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

export const lessonDetailInclude = {
  vocabulary: { orderBy: VOCAB_ORDER },
  points: { orderBy: POINTS_ORDER },
  _count: { select: { exercises: true } },
} satisfies Prisma.GrammarLessonInclude;
