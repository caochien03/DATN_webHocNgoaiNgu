import {
  Prisma,
  PrismaClient,
  TopikQuestionType,
  TopikSection,
  TopikTier,
} from '@prisma/client';
import { TOPIK_I_FORMATS } from './topik-i-formats';
import { TOPIK_II_FORMATS } from './topik-ii-formats';

type QuestionSeed = {
  tier: TopikTier;
  section: TopikSection;
  questionNo: number;
  prompt: string;
  passage?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  audioUrl?: string;
  bundleId?: string;
  points?: number;
};

const SAMPLE_QUESTIONS: QuestionSeed[] = [
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.LISTENING,
    questionNo: 1,
    prompt: '여자: 공책이에요? 남자: ___________________',
    options: [
      '네, 공책이에요.',
      '네, 공책이 없어요.',
      '아니요, 공책이 싸요.',
      '아니요, 공책이 커요.',
    ],
    correctIndex: 0,
    explanation:
      'Câu hỏi xác nhận “Đây là vở phải không?” — đáp án khẳng định phù hợp.',
    points: 4,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.LISTENING,
    questionNo: 7,
    prompt: '여기는 어디입니까?',
    options: ['도서관', '식당', '병원', '공원'],
    correctIndex: 0,
    explanation: 'Nghe hội thoại và xác định địa điểm (thư viện).',
    points: 3,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.LISTENING,
    questionNo: 17,
    prompt: '대화 내용과 같은 것을 고르십시오.',
    passage: '남자: 내일 시험이 있어서 오늘 도서관에서 공부할 거예요.',
    options: [
      '남자는 내일 도서관에 갈 거예요.',
      '남자는 오늘 시험을 봐요.',
      '남자는 도서관에서 일해요.',
      '남자는 내일 공부를 안 해요.',
    ],
    correctIndex: 0,
    points: 3,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.READING,
    questionNo: 1,
    prompt: '무엇에 대한 이야기입니까?',
    passage: '저는 한국 사람입니다. 지금은 베트남에서 한국어를 가르칩니다.',
    options: ['직업', '취미', '가족', '음식'],
    correctIndex: 0,
    explanation: 'Nói về nghề nghiệp (dạy tiếng Hàn).',
    points: 2,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.READING,
    questionNo: 5,
    prompt: '( )에 들어갈 가장 알맞은 것을 고르십시오.',
    passage: '오늘 날씨가 좋아서 친구와 공원에 ( ).',
    options: ['갔어요', '먹었어요', '잤어요', '샀어요'],
    correctIndex: 0,
    points: 2,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.READING,
    questionNo: 10,
    prompt: '다음을 읽고 맞지 않는 것을 고르십시오.',
    passage:
      '월요일부터 금요일까지 도서관은 아침 9시에 열립니다. 토요일에는 10시에 엽니다. 일요일에는 문을 닫습니다.',
    options: [
      '도서관은 월요일에 9시에 열립니다.',
      '토요일에는 10시에 엽니다.',
      '일요일에도 도서관을 이용할 수 있습니다.',
      '평일에는 아침 9시에 열립니다.',
    ],
    correctIndex: 2,
    points: 3,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.READING,
    questionNo: 16,
    prompt: '중심 생각을 고르십시오.',
    passage:
      '저는 매일 아침 운동을 합니다. 운동을 하면 하루가 상쾌하게 시작됩니다. 그래서 운동을 계속할 거예요.',
    options: [
      '저는 운동을 싫어합니다.',
      '운동은 하루를 좋게 시작하게 해 줍니다.',
      '저는 아침에 일찍 일어나지 못합니다.',
      '저는 운동을 그만둘 거예요.',
    ],
    correctIndex: 1,
    points: 3,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.READING,
    questionNo: 27,
    prompt: '다음을 순서대로 맞게 나열한 것을 고르십시오.',
    passage:
      '(가) 그래서 우산을 가져갔어요.\n(나) 오늘 비가 온다고 했어요.\n(다) 밖에 나갈 준비를 했어요.\n(라) 날씨를 확인했어요.',
    options: [
      '(나)－(라)－(다)－(가)',
      '(나)－(다)－(라)－(가)',
      '(라)－(나)－(다)－(가)',
      '(다)－(나)－(라)－(가)',
    ],
    correctIndex: 0,
    points: 3,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.LISTENING,
    questionNo: 25,
    prompt: '다음을 듣고 물음에 맞는 대답을 고르십시오. (1)',
    options: ['네', '아니요', '모르겠어요', '글쎄요'],
    correctIndex: 0,
    bundleId: 'seed-listen-25-26',
    points: 3,
  },
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.LISTENING,
    questionNo: 26,
    prompt: '다음을 듣고 물음에 맞는 대답을 고르십시오. (2)',
    options: ['월요일', '화요일', '수요일', '목요일'],
    correctIndex: 1,
    bundleId: 'seed-listen-25-26',
    points: 3,
  },
];

const TOPIK_II_SAMPLE_QUESTIONS: Array<{
  tier: TopikTier;
  section: TopikSection;
  questionNo: number;
  questionType: TopikQuestionType;
  prompt: string;
  passage?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  modelAnswer?: string;
  writingParts?: Prisma.InputJsonValue;
  minChars?: number;
  maxChars?: number;
  maxScore?: number;
  points?: number;
}> = [
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.LISTENING,
    questionNo: 1,
    questionType: TopikQuestionType.MULTIPLE_CHOICE,
    prompt: '여자: 회의는 몇 시에 시작합니까? 남자: ___________________',
    options: ['2시에요', '3시에요', '4시에요', '5시에요'],
    correctIndex: 1,
    explanation: 'Nghe hội thoại về giờ họp.',
    points: 2,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.LISTENING,
    questionNo: 2,
    questionType: TopikQuestionType.MULTIPLE_CHOICE,
    prompt: '다음을 듣고 중심 생각을 고르십시오.',
    passage: '남자: 이번 프로젝트는 팀워크가 가장 중요합니다.',
    options: [
      '프로젝트는 혼자 하는 것이 좋다',
      '팀워크가 중요하다',
      '프로젝트를 포기했다',
      '회의가 없었다',
    ],
    correctIndex: 1,
    points: 2,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.READING,
    questionNo: 1,
    questionType: TopikQuestionType.MULTIPLE_CHOICE,
    prompt: '( )에 들어갈 가장 알맞은 것을 고르십시오.',
    passage: '환경 보호를 위해 우리는 일상에서 작은 실천을 ( ).',
    options: ['해야 한다', '피해야 한다', '무시해야 한다', '거부해야 한다'],
    correctIndex: 0,
    points: 2,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.READING,
    questionNo: 2,
    questionType: TopikQuestionType.MULTIPLE_CHOICE,
    prompt: '중심 생각을 고르십시오.',
    passage:
      '디지털 기술의 발전은 교육 방식을 변화시키고 있습니다. 온라인 수업은 시간과 장소의 제약을 줄여 줍니다.',
    options: [
      '온라인 수업은 불필요하다',
      '기술 발전이 교육에 영향을 준다',
      '학생은 공부하지 않는다',
      '교실 수업만 유효하다',
    ],
    correctIndex: 1,
    points: 2,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.WRITING,
    questionNo: 51,
    questionType: TopikQuestionType.SHORT_ANSWER,
    prompt: '㉠, ㉡에 들어갈 말을 각각 쓰십시오.',
    passage: '가: 요즘 건강을 위해 (㉠)\n나: 저도 매일 운동을 합니다. (㉡)',
    options: [],
    correctIndex: 0,
    maxScore: 10,
    writingParts: [
      { label: '㉠', modelAnswer: '운동을 합니다.', maxScore: 5 },
      { label: '㉡', modelAnswer: '건강해졌어요.', maxScore: 5 },
    ],
    points: 10,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.WRITING,
    questionNo: 53,
    questionType: TopikQuestionType.ESSAY,
    prompt: '다음 내용을 200~300자로 쓰십시오.',
    passage: '최근 원격 근무가 늘어나고 있습니다.',
    options: [],
    correctIndex: 0,
    minChars: 200,
    maxChars: 300,
    maxScore: 30,
    modelAnswer: '원격 근무는 출퇴근 시간을 줄여 줍니다...',
    points: 30,
  },
];

const EXAM_TITLE = 'TOPIK I — Đề thi thử #1';
const EXAM_TITLE_II = 'TOPIK II — Đề thi thử mini (Nghe·Đọc·Viết)';

export async function seedTopik(prisma: PrismaClient) {
  const ALL_FORMATS = [...TOPIK_I_FORMATS, ...TOPIK_II_FORMATS];
  for (const fmt of ALL_FORMATS) {
    await prisma.topikQuestionFormat.upsert({
      where: {
        tier_section_fromNo_toNo: {
          tier: fmt.tier,
          section: fmt.section,
          fromNo: fmt.fromNo,
          toNo: fmt.toNo,
        },
      },
      create: fmt,
      update: {
        title: fmt.title,
        titleKo: fmt.titleKo,
        description: fmt.description,
        sortOrder: fmt.sortOrder,
      },
    });
  }

  await seedTopikExam(prisma, {
    title: EXAM_TITLE,
    description:
      'Đề mẫu TOPIK I: câu hỏi gắn với đề (pool luyện dạng + thi thử).',
    tier: TopikTier.TOPIK_I,
    durationMinutes: 100,
    sortOrder: 1,
    questions: SAMPLE_QUESTIONS,
  });

  await seedTopikExam(prisma, {
    title: EXAM_TITLE_II,
    description:
      'Đề mini TOPIK II: 2 Nghe + 2 Đọc + 2 Viết — thử luồng thi đầy đủ.',
    tier: TopikTier.TOPIK_II,
    durationMinutes: 180,
    sortOrder: 1,
    questions: TOPIK_II_SAMPLE_QUESTIONS,
  });

  console.log(
    `Đã seed TOPIK: ${ALL_FORMATS.length} dạng bài, đề I (${SAMPLE_QUESTIONS.length} câu) + đề II mini (${TOPIK_II_SAMPLE_QUESTIONS.length} câu).`,
  );
}

async function seedTopikExam(
  prisma: PrismaClient,
  params: {
    title: string;
    description: string;
    tier: TopikTier;
    durationMinutes: number;
    sortOrder: number;
    questions: Array<{
      tier: TopikTier;
      section: TopikSection;
      questionNo: number;
      questionType?: TopikQuestionType;
      prompt: string;
      passage?: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
      modelAnswer?: string;
      writingParts?: Prisma.InputJsonValue;
      minChars?: number;
      maxChars?: number;
      maxScore?: number;
      points?: number;
      audioUrl?: string;
      bundleId?: string;
    }>;
  },
) {
  let exam = await prisma.topikExam.findFirst({
    where: { title: params.title },
  });
  if (!exam) {
    exam = await prisma.topikExam.create({
      data: {
        title: params.title,
        description: params.description,
        tier: params.tier,
        durationMinutes: params.durationMinutes,
        isPublished: true,
        sortOrder: params.sortOrder,
      },
    });
  } else if (!exam.isPublished) {
    exam = await prisma.topikExam.update({
      where: { id: exam.id },
      data: { isPublished: true },
    });
  }

  const existingSlots = await prisma.topikExamQuestion.count({
    where: { examId: exam.id },
  });

  if (existingSlots === 0) {
    for (let i = 0; i < params.questions.length; i++) {
      const q = params.questions[i];
      const question = await prisma.topikQuestion.create({
        data: {
          tier: q.tier,
          section: q.section,
          questionNo: q.questionNo,
          questionType: q.questionType ?? TopikQuestionType.MULTIPLE_CHOICE,
          prompt: q.prompt,
          passage: q.passage,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          modelAnswer: q.modelAnswer,
          writingParts: q.writingParts,
          minChars: q.minChars,
          maxChars: q.maxChars,
          maxScore: q.maxScore,
          audioUrl: q.audioUrl,
          bundleId: q.bundleId,
          points: q.points ?? 2,
          isPublished: true,
        },
      });
      await prisma.topikExamQuestion.create({
        data: {
          examId: exam.id,
          questionId: question.id,
          sortOrder: i,
        },
      });
    }
  }
}
