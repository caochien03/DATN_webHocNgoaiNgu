import { LearningPathStepType, PrismaClient } from '@prisma/client';

type SeedWord = {
  slug: string;
  frontText: string;
  backText: string;
  note?: string;
};

type SeedTopic = {
  slug: string;
  title: string;
  description: string;
  level: string;
  sortOrder: number;
  words: SeedWord[];
};

const SEED_ENGLISH_TOPICS: SeedTopic[] = [
  {
    slug: 'greetings',
    title: 'Chào hỏi cơ bản',
    description: 'Các câu chào hỏi và đáp lễ thường dùng.',
    level: 'A1',
    sortOrder: 1,
    words: [
      { slug: 'hello', frontText: 'hello', backText: 'Xin chào', note: '/həˈloʊ/' },
      { slug: 'hi', frontText: 'hi', backText: 'Chào (thân mật)', note: '/haɪ/' },
      { slug: 'good-morning', frontText: 'good morning', backText: 'Chào buổi sáng' },
      { slug: 'good-afternoon', frontText: 'good afternoon', backText: 'Chào buổi chiều' },
      { slug: 'good-evening', frontText: 'good evening', backText: 'Chào buổi tối' },
      { slug: 'goodbye', frontText: 'goodbye', backText: 'Tạm biệt' },
      { slug: 'see-you', frontText: 'see you later', backText: 'Hẹn gặp lại' },
      { slug: 'thank-you', frontText: 'thank you', backText: 'Cảm ơn' },
      { slug: 'thanks', frontText: 'thanks', backText: 'Cảm ơn (thân mật)' },
      { slug: 'sorry', frontText: 'sorry', backText: 'Xin lỗi' },
      { slug: 'excuse-me', frontText: 'excuse me', backText: 'Xin lỗi / làm ơn' },
      { slug: 'yes', frontText: 'yes', backText: 'Vâng / có' },
      { slug: 'no', frontText: 'no', backText: 'Không' },
      { slug: 'please', frontText: 'please', backText: 'Làm ơn / xin vui lòng' },
      { slug: 'nice-to-meet', frontText: 'nice to meet you', backText: 'Rất vui được gặp bạn' },
    ],
  },
  {
    slug: 'family',
    title: 'Gia đình',
    description: 'Các thành viên trong gia đình.',
    level: 'A1',
    sortOrder: 2,
    words: [
      { slug: 'family', frontText: 'family', backText: 'Gia đình' },
      { slug: 'father', frontText: 'father', backText: 'Bố / cha' },
      { slug: 'mother', frontText: 'mother', backText: 'Mẹ' },
      { slug: 'parents', frontText: 'parents', backText: 'Bố mẹ' },
      { slug: 'brother', frontText: 'brother', backText: 'Anh/em trai' },
      { slug: 'sister', frontText: 'sister', backText: 'Chị/em gái' },
      { slug: 'son', frontText: 'son', backText: 'Con trai' },
      { slug: 'daughter', frontText: 'daughter', backText: 'Con gái' },
      { slug: 'husband', frontText: 'husband', backText: 'Chồng' },
      { slug: 'wife', frontText: 'wife', backText: 'Vợ' },
      { slug: 'grandfather', frontText: 'grandfather', backText: 'Ông' },
      { slug: 'grandmother', frontText: 'grandmother', backText: 'Bà' },
      { slug: 'child', frontText: 'child', backText: 'Đứa trẻ / con' },
      { slug: 'baby', frontText: 'baby', backText: 'Em bé' },
      { slug: 'relative', frontText: 'relative', backText: 'Họ hàng' },
    ],
  },
  {
    slug: 'work',
    title: 'Đi làm',
    description: 'Từ vựng cơ bản về công việc và văn phòng.',
    level: 'A1',
    sortOrder: 3,
    words: [
      { slug: 'work', frontText: 'work', backText: 'Làm việc / công việc' },
      { slug: 'job', frontText: 'job', backText: 'Công việc' },
      { slug: 'office', frontText: 'office', backText: 'Văn phòng' },
      { slug: 'meeting', frontText: 'meeting', backText: 'Cuộc họp' },
      { slug: 'boss', frontText: 'boss', backText: 'Sếp' },
      { slug: 'colleague', frontText: 'colleague', backText: 'Đồng nghiệp' },
      { slug: 'salary', frontText: 'salary', backText: 'Lương' },
      { slug: 'deadline', frontText: 'deadline', backText: 'Hạn chót' },
      { slug: 'email', frontText: 'email', backText: 'Email' },
      { slug: 'report', frontText: 'report', backText: 'Báo cáo' },
      { slug: 'schedule', frontText: 'schedule', backText: 'Lịch trình' },
      { slug: 'break', frontText: 'break', backText: 'Giờ nghỉ' },
      { slug: 'overtime', frontText: 'overtime', backText: 'Làm thêm giờ' },
      { slug: 'interview', frontText: 'interview', backText: 'Phỏng vấn' },
      { slug: 'resume', frontText: 'resume', backText: 'Sơ yếu lý lịch (CV)' },
    ],
  },
  {
    slug: 'travel',
    title: 'Du lịch',
    description: 'Từ vựng khi đi du lịch và di chuyển.',
    level: 'A1',
    sortOrder: 4,
    words: [
      { slug: 'travel', frontText: 'travel', backText: 'Du lịch / đi lại' },
      { slug: 'trip', frontText: 'trip', backText: 'Chuyến đi' },
      { slug: 'airport', frontText: 'airport', backText: 'Sân bay' },
      { slug: 'hotel', frontText: 'hotel', backText: 'Khách sạn' },
      { slug: 'ticket', frontText: 'ticket', backText: 'Vé' },
      { slug: 'passport', frontText: 'passport', backText: 'Hộ chiếu' },
      { slug: 'luggage', frontText: 'luggage', backText: 'Hành lý' },
      { slug: 'map', frontText: 'map', backText: 'Bản đồ' },
      { slug: 'taxi', frontText: 'taxi', backText: 'Taxi' },
      { slug: 'bus', frontText: 'bus', backText: 'Xe buýt' },
      { slug: 'train', frontText: 'train', backText: 'Tàu hỏa' },
      { slug: 'reservation', frontText: 'reservation', backText: 'Đặt chỗ' },
      { slug: 'tourist', frontText: 'tourist', backText: 'Du khách' },
      { slug: 'museum', frontText: 'museum', backText: 'Bảo tàng' },
      { slug: 'beach', frontText: 'beach', backText: 'Bãi biển' },
    ],
  },
  {
    slug: 'shopping',
    title: 'Mua sắm',
    description: 'Từ vựng khi mua sắm và thanh toán.',
    level: 'A1',
    sortOrder: 5,
    words: [
      { slug: 'shop', frontText: 'shop', backText: 'Cửa hàng / mua sắm' },
      { slug: 'store', frontText: 'store', backText: 'Cửa hàng' },
      { slug: 'price', frontText: 'price', backText: 'Giá' },
      { slug: 'cheap', frontText: 'cheap', backText: 'Rẻ' },
      { slug: 'expensive', frontText: 'expensive', backText: 'Đắt' },
      { slug: 'discount', frontText: 'discount', backText: 'Giảm giá' },
      { slug: 'cash', frontText: 'cash', backText: 'Tiền mặt' },
      { slug: 'card', frontText: 'credit card', backText: 'Thẻ tín dụng' },
      { slug: 'receipt', frontText: 'receipt', backText: 'Hóa đơn' },
      { slug: 'size', frontText: 'size', backText: 'Kích cỡ' },
      { slug: 'color', frontText: 'color', backText: 'Màu sắc' },
      { slug: 'try-on', frontText: 'try on', backText: 'Thử (đồ)' },
      { slug: 'return', frontText: 'return', backText: 'Trả hàng' },
      { slug: 'sale', frontText: 'sale', backText: 'Giảm giá / đợt sale' },
      { slug: 'basket', frontText: 'shopping basket', backText: 'Giỏ hàng' },
    ],
  },
];

const PATH_ID = 'seed-en-path-beginner';

export async function seedEnglish(prisma: PrismaClient): Promise<void> {
  const topicIds: string[] = [];

  for (const topicSeed of SEED_ENGLISH_TOPICS) {
    const topicId = `seed-en-topic-${topicSeed.slug}`;
    topicIds.push(topicId);

    const topic = await prisma.vocabularyTopic.upsert({
      where: { id: topicId },
      create: {
        id: topicId,
        title: topicSeed.title,
        description: topicSeed.description,
        languageCode: 'en',
        level: topicSeed.level,
        sortOrder: topicSeed.sortOrder,
      },
      update: {
        title: topicSeed.title,
        description: topicSeed.description,
        languageCode: 'en',
        level: topicSeed.level,
        sortOrder: topicSeed.sortOrder,
      },
    });

    await prisma.vocabularyWord.deleteMany({ where: { topicId: topic.id } });

    await prisma.vocabularyWord.createMany({
      data: topicSeed.words.map((w, i) => ({
        id: `seed-en-word-${topicSeed.slug}-${w.slug}`,
        topicId: topic.id,
        frontText: w.frontText,
        backText: w.backText,
        note: w.note ?? null,
        sortOrder: i,
      })),
    });
  }

  const stepSeeds = SEED_ENGLISH_TOPICS.map((t, i) => ({
    id: `seed-en-path-step-${t.slug}`,
    type: LearningPathStepType.TOPIC,
    title: `Chủ đề: ${t.title}`,
    summary: t.description,
    topicId: `seed-en-topic-${t.slug}`,
    sortOrder: i,
  }));

  await prisma.learningPath.upsert({
    where: { id: PATH_ID },
    create: {
      id: PATH_ID,
      title: 'Tiếng Anh sơ cấp',
      description:
        'Lộ trình mẫu A1 — từ vựng theo chủ đề cho người Việt học tiếng Anh.',
      languageCode: 'en',
      level: 'A1',
      sortOrder: 1,
      steps: {
        create: stepSeeds,
      },
    },
    update: {
      title: 'Tiếng Anh sơ cấp',
      description:
        'Lộ trình mẫu A1 — từ vựng theo chủ đề cho người Việt học tiếng Anh.',
      languageCode: 'en',
      level: 'A1',
      sortOrder: 1,
    },
  });

  for (const step of stepSeeds) {
    await prisma.learningPathStep.upsert({
      where: { id: step.id },
      create: {
        id: step.id,
        pathId: PATH_ID,
        type: step.type,
        title: step.title,
        summary: step.summary,
        topicId: step.topicId,
        sortOrder: step.sortOrder,
      },
      update: {
        title: step.title,
        summary: step.summary,
        topicId: step.topicId,
        sortOrder: step.sortOrder,
      },
    });
  }

  const wordCount = SEED_ENGLISH_TOPICS.reduce((n, t) => n + t.words.length, 0);
  console.log(
    `Đã seed tiếng Anh: ${SEED_ENGLISH_TOPICS.length} chủ đề, ${wordCount} từ, 1 lộ trình.`,
  );
}
