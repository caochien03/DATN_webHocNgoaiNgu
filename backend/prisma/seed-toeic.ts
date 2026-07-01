import {
  PrismaClient,
  ToeicSection,
  ToeicTier,
} from '@prisma/client';
import { TOEIC_LR_FORMATS } from './toeic-formats';

type QuestionSeed = {
  section: ToeicSection;
  questionNo: number;
  prompt: string;
  passage?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  bundleId?: string;
  points?: number;
};

const SAMPLE_QUESTIONS: QuestionSeed[] = [
  {
    section: ToeicSection.LISTENING,
    questionNo: 1,
    prompt: 'Look at the picture. Which sentence best describes it?',
    options: [
      'They are having a meeting.',
      'People are waiting at a bus stop.',
      'A chef is cooking in a kitchen.',
      'Students are reading in a library.',
    ],
    correctIndex: 1,
    explanation: 'Part 1 — mô tả tranh (người đợi xe buýt).',
  },
  {
    section: ToeicSection.LISTENING,
    questionNo: 2,
    prompt: 'Look at the picture. Which sentence best describes it?',
    options: [
      'The man is fixing a computer.',
      'Two colleagues are shaking hands.',
      'A woman is talking on the phone.',
      'Workers are loading boxes onto a truck.',
    ],
    correctIndex: 3,
    explanation: 'Part 1 — mô tả tranh (bốc hàng lên xe tải).',
  },
  {
    section: ToeicSection.LISTENING,
    questionNo: 7,
    prompt: 'Mark your answer on your answer sheet.',
    options: [
      'Yes, I finished it yesterday.',
      'The report is on your desk.',
      'About thirty pages.',
      'At three o\'clock.',
    ],
    correctIndex: 0,
    explanation: 'Part 2 — câu hỏi/đáp án ngắn.',
  },
  {
    section: ToeicSection.LISTENING,
    questionNo: 8,
    prompt: 'Mark your answer on your answer sheet.',
    options: [
      'In the marketing department.',
      'She\'s on vacation this week.',
      'I\'ll send you the file.',
      'No, thank you.',
    ],
    correctIndex: 1,
    explanation: 'Part 2 — hỏi về ai đó.',
  },
  {
    section: ToeicSection.LISTENING,
    questionNo: 32,
    prompt: 'What are the speakers mainly discussing?',
    options: [
      'A product launch date',
      'Office relocation plans',
      'Hiring new staff',
      'Budget cuts',
    ],
    correctIndex: 0,
    explanation: 'Part 3 — hội thoại (1/3).',
    bundleId: 'seed-toeic-listen-32-34',
  },
  {
    section: ToeicSection.LISTENING,
    questionNo: 33,
    prompt: 'When will the event take place?',
    options: ['Next Monday', 'In two weeks', 'At the end of the month', 'Tomorrow'],
    correctIndex: 2,
    bundleId: 'seed-toeic-listen-32-34',
  },
  {
    section: ToeicSection.LISTENING,
    questionNo: 34,
    prompt: 'What does the woman suggest?',
    options: [
      'Canceling the meeting',
      'Sending invitations early',
      'Changing the venue',
      'Hiring a caterer',
    ],
    correctIndex: 1,
    bundleId: 'seed-toeic-listen-32-34',
  },
  {
    section: ToeicSection.LISTENING,
    questionNo: 71,
    prompt: 'What is the purpose of the announcement?',
    options: [
      'To advertise a sale',
      'To inform about schedule changes',
      'To welcome new employees',
      'To request feedback',
    ],
    correctIndex: 1,
    explanation: 'Part 4 — bài nói ngắn.',
    bundleId: 'seed-toeic-listen-71-72',
  },
  {
    section: ToeicSection.LISTENING,
    questionNo: 72,
    prompt: 'What should listeners do?',
    options: [
      'Visit the website',
      'Contact their manager',
      'Arrive earlier than usual',
      'Submit a form',
    ],
    correctIndex: 2,
    bundleId: 'seed-toeic-listen-71-72',
  },
  {
    section: ToeicSection.READING,
    questionNo: 1,
    prompt: 'The new policy will take effect _____ next month.',
    options: ['begin', 'beginning', 'began', 'begun'],
    correctIndex: 1,
    explanation: 'Part 5 — hoàn thành câu.',
  },
  {
    section: ToeicSection.READING,
    questionNo: 2,
    prompt: 'All employees must submit their expense reports _____ Friday.',
    options: ['until', 'by', 'since', 'during'],
    correctIndex: 1,
  },
  {
    section: ToeicSection.READING,
    questionNo: 31,
    prompt: 'Dear Mr. Chen, Thank you for your interest in the position. We were impressed with your qualifications and would like to invite you to an interview.',
    passage:
      'The interview will be held on March 15 at 10 a.m. in our main office. Please bring a copy of your résumé and two forms of identification. If you need to reschedule, contact us at least 24 hours in advance.',
    options: [
      'A job offer letter',
      'An interview invitation',
      'A rejection notice',
      'A training schedule',
    ],
    correctIndex: 1,
    explanation: 'Part 6 — đọc email ngắn.',
  },
  {
    section: ToeicSection.READING,
    questionNo: 32,
    prompt: 'What should Mr. Chen bring to the interview?',
    options: [
      'A laptop and charger',
      'A résumé and ID',
      'Reference letters only',
      'Nothing in particular',
    ],
    correctIndex: 1,
  },
  {
    section: ToeicSection.READING,
    questionNo: 47,
    prompt: 'What is the article mainly about?',
    passage:
      'Remote work has become common in many industries. Companies report higher employee satisfaction when flexible schedules are offered. However, managers must invest in communication tools to keep teams connected.',
    options: [
      'Declining office rents',
      'Trends in remote work',
      'New tax regulations',
      'Travel expense policies',
    ],
    correctIndex: 1,
    explanation: 'Part 7 — đọc hiểu.',
    bundleId: 'seed-toeic-read-47-48',
  },
  {
    section: ToeicSection.READING,
    questionNo: 48,
    prompt: 'According to the article, what do managers need?',
    options: [
      'Larger office space',
      'Better communication tools',
      'Fewer meetings',
      'Mandatory overtime',
    ],
    correctIndex: 1,
    bundleId: 'seed-toeic-read-47-48',
  },
];

const EXAM_ID = 'seed-toeic-exam-mini';

export async function seedToeic(prisma: PrismaClient): Promise<void> {
  for (const fmt of TOEIC_LR_FORMATS) {
    const id = `seed-toeic-format-${fmt.section}-p${fmt.part}`;
    await prisma.toeicQuestionFormat.upsert({
      where: { id },
      create: {
        id,
        tier: fmt.tier,
        section: fmt.section,
        part: fmt.part,
        fromNo: fmt.fromNo,
        toNo: fmt.toNo,
        title: fmt.title,
        titleEn: fmt.titleEn,
        description: fmt.description,
        sortOrder: fmt.sortOrder,
      },
      update: {
        part: fmt.part,
        title: fmt.title,
        titleEn: fmt.titleEn,
        description: fmt.description,
        sortOrder: fmt.sortOrder,
      },
    });
  }

  const exam = await prisma.toeicExam.upsert({
    where: { id: EXAM_ID },
    create: {
      id: EXAM_ID,
      title: 'TOEIC LR — Đề mini',
      description:
        'Đề thử ngắn: Nghe + Đọc — mỗi Part có ít nhất 1 câu mẫu.',
      tier: ToeicTier.TOEIC_LR,
      durationMinutes: 45,
      isPublished: true,
      sortOrder: 1,
    },
    update: {
      title: 'TOEIC LR — Đề mini',
      description:
        'Đề thử ngắn: Nghe + Đọc — mỗi Part có ít nhất 1 câu mẫu.',
      isPublished: true,
    },
  });

  const existingSlots = await prisma.toeicExamQuestion.count({
    where: { examId: exam.id },
  });

  if (existingSlots === 0) {
    for (let i = 0; i < SAMPLE_QUESTIONS.length; i++) {
      const q = SAMPLE_QUESTIONS[i];
      const question = await prisma.toeicQuestion.create({
        data: {
          tier: ToeicTier.TOEIC_LR,
          section: q.section,
          questionNo: q.questionNo,
          prompt: q.prompt,
          passage: q.passage,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          bundleId: q.bundleId,
          points: q.points ?? 1,
          isPublished: true,
        },
      });
      await prisma.toeicExamQuestion.create({
        data: {
          examId: exam.id,
          questionId: question.id,
          sortOrder: i,
        },
      });
    }
  }

  console.log(
    `Đã seed TOEIC: ${TOEIC_LR_FORMATS.length} Part, đề mini (${SAMPLE_QUESTIONS.length} câu).`,
  );
}
