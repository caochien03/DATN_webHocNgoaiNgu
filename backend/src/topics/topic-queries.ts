import { Prisma } from '@prisma/client';

export const TOPIC_LIST_ORDER: Prisma.VocabularyTopicOrderByWithRelationInput[] =
  [{ languageCode: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }];

export const TOPIC_LIST_COUNTS_INCLUDE = {
  _count: { select: { words: true } },
} satisfies Prisma.VocabularyTopicInclude;

const WORDS_ORDER: Prisma.VocabularyWordOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

export const topicDetailInclude = {
  words: { orderBy: WORDS_ORDER },
} satisfies Prisma.VocabularyTopicInclude;
