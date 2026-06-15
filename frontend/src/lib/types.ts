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

/** Admin GET /admin/lessons/:id includes exercises array. */
export type AdminLessonDetail = LessonDetail & {
  exercises: GrammarExercise[];
};

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

export type AdminPathCatalogRow = {
  id: string;
  title: string;
  description: string | null;
  languageCode: string;
  level: string | null;
  sortOrder: number;
  _count: { steps: number };
};

export type AdminPathStep = {
  id: string;
  pathId: string;
  type: "TOPIC" | "LESSON";
  title: string;
  summary: string | null;
  sortOrder: number;
  topicId: string | null;
  lessonId: string | null;
  topic: { id: string; title: string } | null;
  lesson: { id: string; title: string } | null;
};

export type AdminPathDetail = {
  id: string;
  title: string;
  description: string | null;
  languageCode: string;
  level: string | null;
  sortOrder: number;
  steps: AdminPathStep[];
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

export type TopikTier = "TOPIK_I" | "TOPIK_II";
export type TopikSection = "LISTENING" | "READING" | "WRITING";
export type TopikAttemptMode = "FULL_EXAM" | "PRACTICE";

export type TopikWritingPart = {
  label: string;
  modelAnswer?: string;
  maxScore?: number;
};

export type TopikQuestionType =
  | "MULTIPLE_CHOICE"
  | "SHORT_ANSWER"
  | "ESSAY";

export type TopikQuestionFormat = {
  id: string;
  tier: TopikTier;
  section: TopikSection;
  fromNo: number;
  toNo: number;
  title: string;
  titleKo: string | null;
  description: string | null;
  sortOrder: number;
};

export type TopikQuestion = {
  id: string;
  tier: TopikTier;
  section: TopikSection;
  questionNo: number;
  questionType: TopikQuestionType;
  prompt: string;
  passage: string | null;
  options: string[];
  audioUrl: string | null;
  imageUrl: string | null;
  optionImageUrls: string[];
  bundleId?: string | null;
  minChars?: number | null;
  maxChars?: number | null;
  maxScore?: number | null;
  writingParts?: TopikWritingPart[] | null;
  points: number;
};

/** Full question row from admin API (includes answers and metadata). */
export type TopikQuestionAdminRow = {
  id: string;
  tier: TopikTier;
  section: TopikSection;
  questionNo: number;
  questionType: TopikQuestionType;
  prompt: string;
  passage: string | null;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  optionImageUrls: string[];
  bundleId: string | null;
  modelAnswer: string | null;
  writingParts: TopikWritingPart[] | null;
  minChars: number | null;
  maxChars: number | null;
  maxScore: number | null;
  rubric: Record<string, unknown> | null;
  points: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExamQuestionInput = {
  sortOrder: number;
  section: TopikSection;
  questionNo: number;
  questionType?: TopikQuestionType;
  prompt: string;
  passage?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  optionImageUrls?: string[];
  bundleId?: string;
  modelAnswer?: string;
  writingParts?: TopikWritingPart[];
  minChars?: number;
  maxChars?: number;
  maxScore?: number;
  rubric?: Record<string, unknown>;
  points?: number;
};

export type AdminTopikExamListRow = {
  id: string;
  title: string;
  description: string | null;
  tier: TopikTier;
  durationMinutes: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: { questions: number };
};

export type AdminTopikExamSlot = {
  id: string;
  examId: string;
  questionId: string;
  sortOrder: number;
  question: TopikQuestionAdminRow;
};

export type AdminTopikExamDetail = {
  id: string;
  title: string;
  description: string | null;
  tier: TopikTier;
  durationMinutes: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  questions: AdminTopikExamSlot[];
};

export type TopikExamRow = {
  id: string;
  title: string;
  description: string | null;
  tier: TopikTier;
  durationMinutes: number;
  sortOrder: number;
  questionCount: number;
};

export type TopikExamDetail = {
  id: string;
  title: string;
  description: string | null;
  tier: TopikTier;
  durationMinutes: number;
  questionCount: number;
};

/** Đề thi thử kèm câu hỏi cố định (GET /topik/exams/:id). */
export type TopikExamTake = TopikExamDetail & {
  questions: TopikQuestion[];
};

export type GradedTopikAnswer = {
  questionId: string;
  questionNo: number;
  section: TopikSection;
  questionType: TopikQuestionType;
  selectedIndex?: number;
  correctIndex?: number;
  textAnswer?: string;
  textAnswers?: string[];
  writingPartResults?: {
    label: string;
    textAnswer: string;
    modelAnswer?: string | null;
    maxScore?: number | null;
  }[];
  isCorrect: boolean | null;
  gradeStatus: "pending" | "graded" | "not_applicable";
  explanation: string | null;
  modelAnswer?: string | null;
  maxScore?: number | null;
};

export type TopikSubmitResult = {
  attemptId: string;
  mode: TopikAttemptMode;
  tier: TopikTier;
  section?: TopikSection;
  formatFromNo?: number;
  formatToNo?: number;
  examId?: string;
  examTitle?: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  answers: GradedTopikAnswer[];
};

export type TopikAttemptRow = {
  id: string;
  mode: TopikAttemptMode;
  tier: TopikTier;
  section: TopikSection | null;
  formatFromNo: number | null;
  formatToNo: number | null;
  examId: string | null;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  startedAt: string;
  finishedAt: string | null;
  exam: { id: string; title: string } | null;
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

export type GoalMeResponse = {
  dailyCardTarget: number;
  timezone: string;
  today: {
    reviewedCards: number;
    target: number;
    percent: number;
    achieved: boolean;
  };
  streak: number;
  bestStreak: number;
};

export type GoalHistoryRow = {
  date: string;
  reviewedCards: number;
  goalTarget: number;
  goalAchieved: boolean;
};
