import {
  GrammarLevel,
  LearningPathStepType,
  PrismaClient,
} from '@prisma/client';

const PATH_ID = 'seed-en-path-beginner';

type SeedPoint = {
  slug: string;
  title: string;
  meaning?: string;
  structure?: string;
  example?: string;
  translation?: string;
  note?: string;
};

type SeedExercise = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

type SeedLessonVocab = {
  slug: string;
  frontText: string;
  backText: string;
  note?: string;
};

type SeedGrammarLesson = {
  slug: string;
  level: GrammarLevel;
  title: string;
  summary: string;
  sortOrder: number;
  points: SeedPoint[];
  exercises: SeedExercise[];
  vocabulary: SeedLessonVocab[];
};

const SEED_ENGLISH_GRAMMAR: SeedGrammarLesson[] = [
  {
    slug: 'present-simple',
    level: 'BEGINNER_1',
    title: 'Bài 1: Thì hiện tại đơn (Present Simple)',
    summary: 'Diễn tả thói quen, sự thật hiển nhiên và lịch trình cố định.',
    sortOrder: 1,
    points: [
      {
        slug: 'form',
        title: 'Cấu trúc khẳng định',
        meaning: 'Chủ ngữ + V/nguyên mẫu (+ s/es với he/she/it).',
        structure: 'I/You/We/They + V | He/She/It + V-s/es',
        example: 'She works in Hanoi.',
        translation: 'Cô ấy làm việc ở Hà Nội.',
      },
      {
        slug: 'negative',
        title: 'Phủ định',
        structure: "don't / doesn't + V",
        example: "I don't like coffee.",
        translation: 'Tôi không thích cà phê.',
      },
      {
        slug: 'frequency',
        title: 'Trạng từ tần suất',
        meaning: 'always, usually, often, sometimes, never — đứng trước động từ thường.',
        example: 'He often goes to the gym.',
        translation: 'Anh ấy thường đi tập gym.',
      },
    ],
    exercises: [
      {
        prompt: 'She ___ to school every day.',
        options: ['go', 'goes', 'going', 'went'],
        correctIndex: 1,
        explanation: 'Chủ ngữ she → động từ thêm -es.',
      },
      {
        prompt: 'They ___ TV in the evening.',
        options: ["doesn't watch", "don't watch", 'not watch', "isn't watch"],
        correctIndex: 1,
        explanation: 'They → don\'t + V.',
      },
      {
        prompt: 'Water ___ at 100°C.',
        options: ['boil', 'boils', 'boiling', 'boiled'],
        correctIndex: 1,
        explanation: 'Sự thật khoa học — water (it) → boils.',
      },
    ],
    vocabulary: [
      { slug: 'work', frontText: 'work', backText: 'làm việc' },
      { slug: 'live', frontText: 'live', backText: 'sống' },
      { slug: 'study', frontText: 'study', backText: 'học' },
      { slug: 'always', frontText: 'always', backText: 'luôn luôn' },
      { slug: 'usually', frontText: 'usually', backText: 'thường' },
      { slug: 'sometimes', frontText: 'sometimes', backText: 'đôi khi' },
      { slug: 'never', frontText: 'never', backText: 'không bao giờ' },
    ],
  },
  {
    slug: 'past-simple',
    level: 'BEGINNER_1',
    title: 'Bài 2: Thì quá khứ đơn (Past Simple)',
    summary: 'Diễn tả hành động đã xảy ra và kết thúc trong quá khứ.',
    sortOrder: 2,
    points: [
      {
        slug: 'regular',
        title: 'Động từ có quy tắc',
        structure: 'V + -ed (walk → walked)',
        example: 'I visited Da Nang last year.',
        translation: 'Tôi đã thăm Đà Nẵng năm ngoái.',
      },
      {
        slug: 'irregular',
        title: 'Động từ bất quy tắc',
        meaning: 'go → went, see → saw, have → had…',
        example: 'She went to the market yesterday.',
        translation: 'Cô ấy đã đi chợ hôm qua.',
      },
      {
        slug: 'negative',
        title: 'Phủ định & câu hỏi',
        structure: "didn't + V | Did + S + V?",
        example: "Did you finish your homework?",
        translation: 'Bạn đã làm xong bài tập chưa?',
      },
    ],
    exercises: [
      {
        prompt: 'We ___ (watch) a movie last night.',
        options: ['watch', 'watched', 'watching', 'watches'],
        correctIndex: 1,
        explanation: 'Last night → quá khứ đơn: watched.',
      },
      {
        prompt: 'He ___ to London in 2020.',
        options: ['go', 'goes', 'went', 'going'],
        correctIndex: 2,
        explanation: 'go là động từ bất quy tắc: went.',
      },
      {
        prompt: "___ you see him yesterday?",
        options: ['Do', 'Did', 'Does', 'Were'],
        correctIndex: 1,
        explanation: 'Câu hỏi quá khứ dùng Did.',
      },
    ],
    vocabulary: [
      { slug: 'yesterday', frontText: 'yesterday', backText: 'hôm qua' },
      { slug: 'last-week', frontText: 'last week', backText: 'tuần trước' },
      { slug: 'ago', frontText: 'ago', backText: 'cách đây (thời gian)' },
      { slug: 'finished', frontText: 'finished', backText: 'đã hoàn thành' },
      { slug: 'visited', frontText: 'visited', backText: 'đã thăm' },
      { slug: 'bought', frontText: 'bought', backText: 'đã mua' },
    ],
  },
  {
    slug: 'questions',
    level: 'BEGINNER_1',
    title: 'Bài 3: Câu hỏi Yes/No và Wh-',
    summary: 'Đặt câu hỏi với do/does/did và từ để hỏi.',
    sortOrder: 3,
    points: [
      {
        slug: 'yes-no',
        title: 'Câu hỏi Yes/No',
        structure: 'Do/Does + S + V? | Did + S + V?',
        example: 'Do you speak English?',
        translation: 'Bạn có nói tiếng Anh không?',
      },
      {
        slug: 'wh',
        title: 'Câu hỏi Wh-',
        meaning: 'What, Where, When, Who, Why, How',
        example: 'Where do you live?',
        translation: 'Bạn sống ở đâu?',
      },
      {
        slug: 'short',
        title: 'Câu trả lời ngắn',
        example: 'Yes, I do. / No, I don\'t.',
        translation: 'Có. / Không.',
      },
    ],
    exercises: [
      {
        prompt: '___ does she get up? — At 6 a.m.',
        options: ['What', 'When', 'Where', 'Who'],
        correctIndex: 1,
        explanation: 'Hỏi thời gian → When.',
      },
      {
        prompt: '___ you like pizza?',
        options: ['Do', 'Does', 'Did', 'Are'],
        correctIndex: 0,
        explanation: 'You → Do + S + V.',
      },
      {
        prompt: '___ is your name?',
        options: ['What', 'Where', 'When', 'How'],
        correctIndex: 0,
        explanation: 'Hỏi tên → What.',
      },
    ],
    vocabulary: [
      { slug: 'what', frontText: 'what', backText: 'cái gì' },
      { slug: 'where', frontText: 'where', backText: 'ở đâu' },
      { slug: 'when', frontText: 'when', backText: 'khi nào' },
      { slug: 'who', frontText: 'who', backText: 'ai' },
      { slug: 'why', frontText: 'why', backText: 'tại sao' },
      { slug: 'how', frontText: 'how', backText: 'như thế nào' },
    ],
  },
  {
    slug: 'prepositions',
    level: 'BEGINNER_1',
    title: 'Bài 4: Giới từ in / on / at',
    summary: 'Giới từ chỉ thời gian và nơi chốn cơ bản.',
    sortOrder: 4,
    points: [
      {
        slug: 'time',
        title: 'Chỉ thời gian',
        meaning: 'at + giờ | on + ngày | in + tháng/năm/mùa',
        example: 'at 8 o\'clock, on Monday, in July',
        translation: 'lúc 8 giờ, vào thứ Hai, trong tháng 7',
      },
      {
        slug: 'place',
        title: 'Chỉ nơi chốn',
        meaning: 'at + điểm cụ thể | on + bề mặt | in + không gian bao quanh',
        example: 'at the station, on the table, in the room',
        translation: 'ở nhà ga, trên bàn, trong phòng',
      },
    ],
    exercises: [
      {
        prompt: 'The meeting is ___ 3 p.m.',
        options: ['in', 'on', 'at', 'to'],
        correctIndex: 2,
        explanation: 'Giờ cụ thể dùng at.',
      },
      {
        prompt: 'My birthday is ___ May.',
        options: ['in', 'on', 'at', 'by'],
        correctIndex: 0,
        explanation: 'Tháng dùng in.',
      },
      {
        prompt: 'The book is ___ the desk.',
        options: ['in', 'on', 'at', 'to'],
        correctIndex: 1,
        explanation: 'Trên mặt bàn dùng on.',
      },
    ],
    vocabulary: [
      { slug: 'morning', frontText: 'in the morning', backText: 'vào buổi sáng' },
      { slug: 'monday', frontText: 'on Monday', backText: 'vào thứ Hai' },
      { slug: 'home', frontText: 'at home', backText: 'ở nhà' },
      { slug: 'bus', frontText: 'on the bus', backText: 'trên xe buýt' },
      { slug: 'room', frontText: 'in the room', backText: 'trong phòng' },
    ],
  },
  {
    slug: 'present-continuous',
    level: 'BEGINNER_1',
    title: 'Bài 5: Thì hiện tại tiếp diễn (Present Continuous)',
    summary: 'Diễn tả hành động đang diễn ra ngay lúc nói.',
    sortOrder: 5,
    points: [
      {
        slug: 'form',
        title: 'Cấu trúc',
        structure: 'am / is / are + V-ing',
        example: 'I am studying English now.',
        translation: 'Tôi đang học tiếng Anh bây giờ.',
      },
      {
        slug: 'spelling',
        title: 'Quy tắc thêm -ing',
        meaning: 'run → running, write → writing, play → playing',
        example: 'She is reading a book.',
        translation: 'Cô ấy đang đọc sách.',
      },
      {
        slug: 'vs-simple',
        title: 'So với hiện tại đơn',
        meaning: 'Hiện tại đơn: thói quen. Hiện tại tiếp diễn: đang làm ngay bây giờ.',
        example: 'I work every day. / I am working now.',
        translation: 'Tôi làm việc mỗi ngày. / Tôi đang làm việc bây giờ.',
      },
    ],
    exercises: [
      {
        prompt: 'Listen! The baby ___.',
        options: ['cries', 'is crying', 'cry', 'cried'],
        correctIndex: 1,
        explanation: 'Hành động đang xảy ra → is crying.',
      },
      {
        prompt: 'They ___ dinner right now.',
        options: ['cook', 'cooks', 'are cooking', 'cooked'],
        correctIndex: 2,
        explanation: 'Right now → are cooking.',
      },
      {
        prompt: 'She ___ (not/work) today.',
        options: ["doesn't work", "isn't working", "don't work", 'not working'],
        correctIndex: 1,
        explanation: 'Phủ định tiếp diễn: isn\'t + V-ing.',
      },
    ],
    vocabulary: [
      { slug: 'now', frontText: 'now', backText: 'bây giờ' },
      { slug: 'right-now', frontText: 'right now', backText: 'ngay bây giờ' },
      { slug: 'reading', frontText: 'reading', backText: 'đang đọc' },
      { slug: 'cooking', frontText: 'cooking', backText: 'đang nấu' },
      { slug: 'waiting', frontText: 'waiting', backText: 'đang chờ' },
    ],
  },
];

/** Xen kẽ chủ đề từ vựng và bài ngữ pháp trên lộ trình A1. */
const PATH_STEP_PLAN: Array<
  | { kind: 'topic'; topicSlug: string }
  | { kind: 'lesson'; lessonSlug: string }
> = [
  { kind: 'topic', topicSlug: 'greetings' },
  { kind: 'lesson', lessonSlug: 'present-simple' },
  { kind: 'topic', topicSlug: 'family' },
  { kind: 'lesson', lessonSlug: 'past-simple' },
  { kind: 'topic', topicSlug: 'work' },
  { kind: 'lesson', lessonSlug: 'questions' },
  { kind: 'topic', topicSlug: 'travel' },
  { kind: 'lesson', lessonSlug: 'prepositions' },
  { kind: 'topic', topicSlug: 'shopping' },
  { kind: 'lesson', lessonSlug: 'present-continuous' },
];

const TOPIC_META: Record<string, { title: string; description: string }> = {
  greetings: {
    title: 'Chào hỏi cơ bản',
    description: 'Làm quen các câu chào hỏi và đáp lễ.',
  },
  family: {
    title: 'Gia đình',
    description: 'Từ vựng các thành viên gia đình.',
  },
  work: {
    title: 'Đi làm',
    description: 'Từ vựng cơ bản về công việc.',
  },
  travel: {
    title: 'Du lịch',
    description: 'Từ vựng khi đi du lịch.',
  },
  shopping: {
    title: 'Mua sắm',
    description: 'Từ vựng khi mua sắm.',
  },
};

async function upsertLesson(
  prisma: PrismaClient,
  lessonSeed: SeedGrammarLesson,
): Promise<void> {
  const lessonId = `seed-en-lesson-${lessonSeed.slug}`;

  const lesson = await prisma.grammarLesson.upsert({
    where: { id: lessonId },
    create: {
      id: lessonId,
      level: lessonSeed.level,
      title: lessonSeed.title,
      summary: lessonSeed.summary,
      languageCode: 'en',
      sortOrder: lessonSeed.sortOrder,
    },
    update: {
      level: lessonSeed.level,
      title: lessonSeed.title,
      summary: lessonSeed.summary,
      languageCode: 'en',
      sortOrder: lessonSeed.sortOrder,
    },
  });

  await prisma.grammarPoint.deleteMany({ where: { lessonId: lesson.id } });
  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson.id } });
  await prisma.lessonVocabulary.deleteMany({ where: { lessonId: lesson.id } });

  if (lessonSeed.points.length > 0) {
    await prisma.grammarPoint.createMany({
      data: lessonSeed.points.map((p, i) => ({
        id: `seed-en-point-${lessonSeed.slug}-${p.slug}`,
        lessonId: lesson.id,
        title: p.title,
        meaning: p.meaning ?? null,
        structure: p.structure ?? null,
        example: p.example ?? null,
        translation: p.translation ?? null,
        note: p.note ?? null,
        sortOrder: i,
      })),
    });
  }

  if (lessonSeed.exercises.length > 0) {
    await prisma.grammarExercise.createMany({
      data: lessonSeed.exercises.map((e, i) => ({
        lessonId: lesson.id,
        prompt: e.prompt,
        options: e.options,
        correctIndex: e.correctIndex,
        explanation: e.explanation ?? null,
        sortOrder: i,
      })),
    });
  }

  if (lessonSeed.vocabulary.length > 0) {
    await prisma.lessonVocabulary.createMany({
      data: lessonSeed.vocabulary.map((v, i) => ({
        id: `seed-en-lesson-vocab-${lessonSeed.slug}-${v.slug}`,
        lessonId: lesson.id,
        frontText: v.frontText,
        backText: v.backText,
        note: v.note ?? null,
        sortOrder: i,
      })),
    });
  }
}

async function syncEnglishLearningPath(prisma: PrismaClient): Promise<void> {
  const stepIds: string[] = [];

  for (let i = 0; i < PATH_STEP_PLAN.length; i++) {
    const plan = PATH_STEP_PLAN[i];
    const stepId =
      plan.kind === 'topic'
        ? `seed-en-path-step-${plan.topicSlug}`
        : `seed-en-path-step-lesson-${plan.lessonSlug}`;
    stepIds.push(stepId);

    if (plan.kind === 'topic') {
      const meta = TOPIC_META[plan.topicSlug];
      await prisma.learningPathStep.upsert({
        where: { id: stepId },
        create: {
          id: stepId,
          pathId: PATH_ID,
          type: LearningPathStepType.TOPIC,
          title: `Chủ đề: ${meta.title}`,
          summary: meta.description,
          topicId: `seed-en-topic-${plan.topicSlug}`,
          sortOrder: i,
        },
        update: {
          type: LearningPathStepType.TOPIC,
          title: `Chủ đề: ${meta.title}`,
          summary: meta.description,
          topicId: `seed-en-topic-${plan.topicSlug}`,
          lessonId: null,
          sortOrder: i,
        },
      });
    } else {
      const lesson = SEED_ENGLISH_GRAMMAR.find((l) => l.slug === plan.lessonSlug);
      await prisma.learningPathStep.upsert({
        where: { id: stepId },
        create: {
          id: stepId,
          pathId: PATH_ID,
          type: LearningPathStepType.LESSON,
          title: lesson?.title ?? plan.lessonSlug,
          summary: lesson?.summary ?? '',
          lessonId: `seed-en-lesson-${plan.lessonSlug}`,
          sortOrder: i,
        },
        update: {
          type: LearningPathStepType.LESSON,
          title: lesson?.title ?? plan.lessonSlug,
          summary: lesson?.summary ?? '',
          lessonId: `seed-en-lesson-${plan.lessonSlug}`,
          topicId: null,
          sortOrder: i,
        },
      });
    }
  }

  await prisma.learningPathStep.deleteMany({
    where: {
      pathId: PATH_ID,
      id: { notIn: stepIds },
    },
  });

  await prisma.learningPath.update({
    where: { id: PATH_ID },
    data: {
      description:
        'Lộ trình A1 — từ vựng theo chủ đề và ngữ pháp nền tảng (tiếng Anh).',
    },
  });
}

export async function seedEnglishGrammar(prisma: PrismaClient): Promise<void> {
  for (const lesson of SEED_ENGLISH_GRAMMAR) {
    await upsertLesson(prisma, lesson);
  }

  await syncEnglishLearningPath(prisma);

  const exerciseCount = SEED_ENGLISH_GRAMMAR.reduce(
    (n, l) => n + l.exercises.length,
    0,
  );
  const vocabCount = SEED_ENGLISH_GRAMMAR.reduce(
    (n, l) => n + l.vocabulary.length,
    0,
  );

  console.log(
    `Đã seed ngữ pháp tiếng Anh: ${SEED_ENGLISH_GRAMMAR.length} bài, ${exerciseCount} bài tập, ${vocabCount} từ vựng bài; lộ trình ${PATH_STEP_PLAN.length} bước.`,
  );
}
