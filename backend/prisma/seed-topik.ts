import {
  PrismaClient,
  TopikSection,
  TopikTier,
} from '@prisma/client';
import { TOPIK_I_FORMATS } from './topik-i-formats';

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
  points?: number;
};

const SAMPLE_QUESTIONS: QuestionSeed[] = [
  // Nghe — câu 1 (dạng 1–4)
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
    explanation: 'Câu hỏi xác nhận “Đây là vở phải không?” — đáp án khẳng định phù hợp.',
    points: 4,
  },
  // Nghe — câu 7 (dạng 7–10)
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
  // Nghe — câu 17 (dạng 17–21)
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
  // Đọc — câu 1 (dạng 1–3)
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
  // Đọc — câu 5 (dạng 4–9)
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
  // Đọc — câu 10 (dạng 10–12)
  {
    tier: TopikTier.TOPIK_I,
    section: TopikSection.READING,
    questionNo: 10,
    prompt: '다음을 읽고 맞지 않는 것을 고르십시오.',
    passage:
      '월요일부터 금요일까지 도서관은 아침 9시에 열립니다. 토요일에는 10시에 엽니다. 일요일에는 문을 닫습니다.',
    options: [
      '도서관은 월요일에 9시에 열립니다.',
      '토요일에는 10시에 열립니다.',
      '일요일에도 도서관을 이용할 수 있습니다.',
      '평일에는 아침 9시에 열립니다.',
    ],
    correctIndex: 2,
    points: 3,
  },
  // Đọc — câu 16 (dạng 16–18)
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
  // Đọc — câu 27 (dạng 27–28)
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
];

export async function seedTopik(prisma: PrismaClient) {
  for (const fmt of TOPIK_I_FORMATS) {
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

  const questionIds: string[] = [];
  for (const q of SAMPLE_QUESTIONS) {
    const existing = await prisma.topikQuestion.findFirst({
      where: {
        tier: q.tier,
        section: q.section,
        questionNo: q.questionNo,
        prompt: q.prompt,
      },
      select: { id: true },
    });
    if (existing) {
      questionIds.push(existing.id);
      continue;
    }
    const created = await prisma.topikQuestion.create({
      data: {
        tier: q.tier,
        section: q.section,
        questionNo: q.questionNo,
        prompt: q.prompt,
        passage: q.passage,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        audioUrl: q.audioUrl,
        points: q.points ?? 2,
      },
    });
    questionIds.push(created.id);
  }

  const examTitle = 'TOPIK I — Đề thi thử #1';
  let exam = await prisma.topikExam.findFirst({
    where: { title: examTitle },
  });
  if (!exam) {
    exam = await prisma.topikExam.create({
      data: {
        title: examTitle,
        description: 'Đề mẫu: nghe + đọc (câu seed, mở rộng sau).',
        tier: TopikTier.TOPIK_I,
        durationMinutes: 100,
        sortOrder: 1,
      },
    });
  }

  const existingSlots = await prisma.topikExamQuestion.count({
    where: { examId: exam.id },
  });
  if (existingSlots === 0) {
    await prisma.topikExamQuestion.createMany({
      data: questionIds.map((questionId, i) => ({
        examId: exam.id,
        questionId,
        sortOrder: i + 1,
      })),
    });
  }

  console.log(
    `Đã seed TOPIK I: ${TOPIK_I_FORMATS.length} dạng bài, ${SAMPLE_QUESTIONS.length} câu mẫu, 1 đề thi thử.`,
  );
}
