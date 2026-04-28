export type CardRow = {
  id: string;
  frontText: string;
  backText: string;
  note: string | null;
  sortOrder: number;
  correctCount: number;
  wrongCount: number;
  streak: number;
  lastResult: boolean | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
};

export type DeckDetail = {
  id: string;
  title: string;
  description: string | null;
  cards: CardRow[];
};

export type DeckWithStats = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  total: number;
  learned: number;
  weak: number;
  reviewed: number;
};

export type DecksTotals = {
  decks: number;
  cards: number;
  learned: number;
  weak: number;
  reviewed: number;
  reviewedToday: number;
  reviewedLast7Days: number;
};

export type DecksResponse = {
  decks: DeckWithStats[];
  totals: DecksTotals;
};

export type VocabWord = {
  id: string;
  frontText: string;
  backText: string;
  note: string | null;
  sortOrder: number;
};

export type TopicRow = {
  id: string;
  title: string;
  description: string | null;
  languageCode: string;
  level: string | null;
  sortOrder: number;
  _count: { words: number };
};

export type GrammarLevel =
  | "BEGINNER_1"
  | "BEGINNER_2"
  | "INTERMEDIATE_1"
  | "INTERMEDIATE_2"
  | "ADVANCED_1"
  | "ADVANCED_2";

export type GrammarPoint = {
  id: string;
  lessonId: string;
  title: string;
  meaning: string | null;
  structure: string | null;
  example: string | null;
  translation: string | null;
  note: string | null;
  sortOrder: number;
};

export type LessonVocabulary = {
  id: string;
  lessonId: string;
  frontText: string;
  backText: string;
  note: string | null;
  sortOrder: number;
};

export type LessonRow = {
  id: string;
  level: GrammarLevel;
  title: string;
  summary: string | null;
  sortOrder: number;
  _count: { vocabulary: number; points: number; exercises: number };
};

export type LessonDetail = {
  id: string;
  level: GrammarLevel;
  title: string;
  summary: string | null;
  sortOrder: number;
  vocabulary: LessonVocabulary[];
  points: GrammarPoint[];
  _count: { exercises: number };
};

export type GrammarLessonRow = LessonRow;
export type GrammarLessonDetail = LessonDetail;

export type GrammarExercise = {
  id: string;
  lessonId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  sortOrder: number;
};

export type TopicDetail = {
  id: string;
  title: string;
  description: string | null;
  languageCode: string;
  level: string | null;
  sortOrder: number;
  words: VocabWord[];
};

export type LearningPathRow = {
  id: string;
  title: string;
  description: string | null;
  languageCode: string;
  level: string | null;
  totalSteps: number;
  completedSteps: number;
  started: boolean;
  percent: number;
};

export type LearningPathStep = {
  id: string;
  type: "TOPIC" | "LESSON";
  title: string;
  summary: string | null;
  sortOrder: number;
  topicId: string | null;
  lessonId: string | null;
  topic: { id: string; title: string; _count: { words: number } } | null;
  lesson: {
    id: string;
    title: string;
    _count: { vocabulary: number; points: number; exercises: number };
  } | null;
  completed: boolean;
};

export type LearningPathDetail = {
  id: string;
  title: string;
  description: string | null;
  languageCode: string;
  level: string | null;
  progress: {
    completedStepIds: string[];
    startedAt: string;
    updatedAt: string;
  } | null;
  steps: LearningPathStep[];
};

export type QuizSourceType = "DECK" | "TOPIC" | "LESSON" | "PATH";

export type QuizAttempt = {
  id: string;
  userId: string;
  sourceType: QuizSourceType;
  sourceId: string;
  sourceTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  createdAt: string;
};
