import { Prisma } from '@prisma/client';

export const PATH_LIST_ORDER: Prisma.LearningPathOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

export const PATH_LIST_COUNTS_INCLUDE = {
  _count: { select: { steps: true } },
} satisfies Prisma.LearningPathInclude;

const STEPS_ORDER: Prisma.LearningPathStepOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

export const pathAdminDetailInclude = {
  steps: {
    orderBy: STEPS_ORDER,
    include: {
      topic: { select: { id: true, title: true } },
      lesson: { select: { id: true, title: true } },
    },
  },
} satisfies Prisma.LearningPathInclude;
