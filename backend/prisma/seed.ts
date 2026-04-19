import { GrammarLevel, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedWord = {
  frontText: string;
  backText: string;
  note?: string;
};

type SeedTopic = {
  title: string;
  description: string;
  level: string;
  languageCode: string;
  sortOrder: number;
  words: SeedWord[];
};

const SEED_TOPICS: SeedTopic[] = [
  {
    title: 'Chào hỏi cơ bản',
    description: 'Các câu chào hỏi và đáp lễ thường dùng.',
    level: 'TOPIK 1',
    languageCode: 'ko',
    sortOrder: 1,
    words: [
      { frontText: '안녕하세요', backText: 'Xin chào', note: 'an-nyeong-ha-se-yo' },
      { frontText: '안녕', backText: 'Chào (thân mật)', note: 'an-nyeong' },
      { frontText: '감사합니다', backText: 'Cảm ơn', note: 'gam-sa-ham-ni-da' },
      { frontText: '고마워요', backText: 'Cảm ơn (thân)', note: 'go-ma-wo-yo' },
      { frontText: '미안해요', backText: 'Xin lỗi', note: 'mi-an-hae-yo' },
      { frontText: '죄송합니다', backText: 'Xin lỗi (trang trọng)', note: 'joe-song-ham-ni-da' },
      { frontText: '안녕히 가세요', backText: 'Tạm biệt (người đi)', note: 'an-nyeong-hi ga-se-yo' },
      { frontText: '안녕히 계세요', backText: 'Tạm biệt (người ở)', note: 'an-nyeong-hi gye-se-yo' },
      { frontText: '네', backText: 'Vâng', note: 'ne' },
      { frontText: '아니요', backText: 'Không', note: 'a-ni-yo' },
    ],
  },
  {
    title: 'Gia đình',
    description: 'Các thành viên trong gia đình.',
    level: 'TOPIK 1',
    languageCode: 'ko',
    sortOrder: 2,
    words: [
      { frontText: '가족', backText: 'Gia đình', note: 'ga-jok' },
      { frontText: '아버지', backText: 'Bố', note: 'a-beo-ji' },
      { frontText: '어머니', backText: 'Mẹ', note: 'eo-meo-ni' },
      { frontText: '형', backText: 'Anh trai (nam gọi)', note: 'hyeong' },
      { frontText: '오빠', backText: 'Anh trai (nữ gọi)', note: 'oppa' },
      { frontText: '누나', backText: 'Chị gái (nam gọi)', note: 'nu-na' },
      { frontText: '언니', backText: 'Chị gái (nữ gọi)', note: 'eon-ni' },
      { frontText: '동생', backText: 'Em', note: 'dong-saeng' },
      { frontText: '할아버지', backText: 'Ông', note: 'hal-a-beo-ji' },
      { frontText: '할머니', backText: 'Bà', note: 'hal-meo-ni' },
    ],
  },
  {
    title: 'Số đếm 1 – 10 (Hán Hàn)',
    description: 'Số đếm dạng Hán Hàn dùng cho ngày, tháng, số điện thoại…',
    level: 'TOPIK 1',
    languageCode: 'ko',
    sortOrder: 3,
    words: [
      { frontText: '일', backText: '1', note: 'il' },
      { frontText: '이', backText: '2', note: 'i' },
      { frontText: '삼', backText: '3', note: 'sam' },
      { frontText: '사', backText: '4', note: 'sa' },
      { frontText: '오', backText: '5', note: 'o' },
      { frontText: '육', backText: '6', note: 'yuk' },
      { frontText: '칠', backText: '7', note: 'chil' },
      { frontText: '팔', backText: '8', note: 'pal' },
      { frontText: '구', backText: '9', note: 'gu' },
      { frontText: '십', backText: '10', note: 'sip' },
    ],
  },
  {
    title: 'Màu sắc',
    description: 'Các màu thường gặp.',
    level: 'TOPIK 1',
    languageCode: 'ko',
    sortOrder: 4,
    words: [
      { frontText: '빨간색', backText: 'Màu đỏ', note: 'ppal-gan-saek' },
      { frontText: '파란색', backText: 'Màu xanh dương', note: 'pa-ran-saek' },
      { frontText: '노란색', backText: 'Màu vàng', note: 'no-ran-saek' },
      { frontText: '초록색', backText: 'Màu xanh lá', note: 'cho-rok-saek' },
      { frontText: '검은색', backText: 'Màu đen', note: 'geo-meun-saek' },
      { frontText: '흰색', backText: 'Màu trắng', note: 'huin-saek' },
      { frontText: '보라색', backText: 'Màu tím', note: 'bo-ra-saek' },
      { frontText: '주황색', backText: 'Màu cam', note: 'ju-hwang-saek' },
      { frontText: '분홍색', backText: 'Màu hồng', note: 'bun-hong-saek' },
      { frontText: '회색', backText: 'Màu xám', note: 'hoe-saek' },
    ],
  },
];

type SeedGrammarPoint = {
  title: string;
  meaning?: string;
  structure?: string;
  example?: string;
  translation?: string;
  note?: string;
};

type SeedGrammarLesson = {
  level: GrammarLevel;
  title: string;
  summary?: string;
  points: SeedGrammarPoint[];
};

const SEED_GRAMMAR_LESSONS: SeedGrammarLesson[] = [
  // --- Sơ cấp 1 ---
  {
    level: 'BEGINNER_1',
    title: 'Bài 1: Câu giới thiệu bản thân',
    summary: 'Mẫu câu “Tôi là…” và trợ từ chủ ngữ / chủ đề.',
    points: [
      {
        title: '이에요/예요',
        meaning: 'Là (danh từ + động từ “to be”).',
        structure: 'N + 이에요 (sau phụ âm) / 예요 (sau nguyên âm)',
        example: '저는 학생이에요.',
        translation: 'Tôi là học sinh.',
      },
      {
        title: '이/가',
        meaning: 'Trợ từ chủ ngữ.',
        structure: 'N + 이 (sau phụ âm) / 가 (sau nguyên âm)',
        example: '사과가 있어요.',
        translation: 'Có táo.',
      },
      {
        title: '은/는',
        meaning: 'Trợ từ chủ đề.',
        structure: 'N + 은 (sau phụ âm) / 는 (sau nguyên âm)',
        example: '저는 한국 사람이에요.',
        translation: 'Tôi là người Hàn.',
      },
    ],
  },
  {
    level: 'BEGINNER_1',
    title: 'Bài 2: Hành động hàng ngày',
    summary: 'Đuôi câu lịch sự và trợ từ tân ngữ.',
    points: [
      {
        title: '을/를',
        meaning: 'Trợ từ tân ngữ.',
        example: '밥을 먹어요.',
        translation: 'Ăn cơm.',
      },
      {
        title: '-아/어요',
        meaning: 'Đuôi câu lịch sự.',
        structure: 'Gốc V + -아요 / -어요',
        example: '학교에 가요.',
        translation: 'Đi học.',
      },
      {
        title: '-ㅂ/습니다',
        meaning: 'Đuôi câu trang trọng.',
        structure: 'Gốc V + -ㅂ니다 (nguyên âm) / -습니다 (phụ âm)',
        example: '공부합니다.',
        translation: 'Tôi học.',
      },
    ],
  },
  {
    level: 'BEGINNER_1',
    title: 'Bài 3: Liên kết câu',
    summary: 'Nối hai vế câu cơ bản.',
    points: [
      {
        title: '-고',
        meaning: 'Và (nối hai vế).',
        example: '밥을 먹고 자요.',
        translation: 'Ăn cơm rồi ngủ.',
      },
      {
        title: '-지만',
        meaning: 'Nhưng.',
        example: '매워요, 지만 맛있어요.',
        translation: 'Cay nhưng ngon.',
      },
    ],
  },

  // --- Sơ cấp 2 ---
  {
    level: 'BEGINNER_2',
    title: 'Bài 1: Đề nghị và mong muốn',
    summary: 'Nhờ giúp, thử làm, dự định.',
    points: [
      {
        title: '-아/어 주세요',
        meaning: 'Làm ơn… (đề nghị).',
        example: '도와 주세요.',
        translation: 'Làm ơn giúp tôi.',
      },
      {
        title: '-(으)ㄹ 거예요',
        meaning: 'Sẽ (thì tương lai).',
        example: '내일 갈 거예요.',
        translation: 'Ngày mai sẽ đi.',
      },
      {
        title: '-아/어 보다',
        meaning: 'Thử.',
        example: '먹어 보세요.',
        translation: 'Hãy thử ăn xem.',
      },
    ],
  },
  {
    level: 'BEGINNER_2',
    title: 'Bài 2: Lý do và ngăn cấm',
    summary: 'Đưa lý do, đừng làm gì.',
    points: [
      {
        title: '-(으)니까',
        meaning: 'Vì (lý do, ý chủ quan).',
        example: '비가 오니까 우산을 가져가세요.',
        translation: 'Vì trời mưa nên hãy mang ô.',
      },
      {
        title: '-지 말다',
        meaning: 'Đừng (cấm đoán).',
        example: '가지 마세요.',
        translation: 'Đừng đi.',
      },
    ],
  },
  {
    level: 'BEGINNER_2',
    title: 'Bài 3: Định ngữ',
    summary: 'Bổ nghĩa cho danh từ theo thì.',
    points: [
      {
        title: '-는/(으)ㄴ (định ngữ)',
        meaning: 'Bổ nghĩa cho danh từ theo thì.',
        structure: 'V+는 (hiện tại) · V+(으)ㄴ (quá khứ) · V+(으)ㄹ (tương lai)',
        example: '먹는 사람, 먹은 사람, 먹을 사람',
        translation: 'Người đang ăn / đã ăn / sẽ ăn.',
      },
    ],
  },

  // --- Trung cấp 1 ---
  {
    level: 'INTERMEDIATE_1',
    title: 'Bài 1: Đồng thời và xu hướng',
    summary: 'Hai hành động cùng lúc, xếp loại.',
    points: [
      {
        title: '-(으)면서',
        meaning: 'Vừa… vừa…',
        example: '음악을 들으면서 운동해요.',
        translation: 'Vừa nghe nhạc vừa tập thể dục.',
      },
      {
        title: '-(으)ㄴ/는 편이다',
        meaning: 'Thuộc loại, có xu hướng.',
        example: '한국어가 쉬운 편이에요.',
        translation: 'Tiếng Hàn thuộc loại dễ.',
      },
    ],
  },
  {
    level: 'INTERMEDIATE_1',
    title: 'Bài 2: Phép và nghĩa vụ',
    summary: 'Được phép làm, cần phải làm.',
    points: [
      {
        title: '-아/어도 되다',
        meaning: 'Được phép.',
        example: '여기에 앉아도 돼요.',
        translation: 'Có thể ngồi ở đây.',
      },
      {
        title: '-아/어야 되다',
        meaning: 'Phải, cần.',
        example: '내일 일찍 일어나야 돼요.',
        translation: 'Ngày mai phải dậy sớm.',
      },
    ],
  },
  {
    level: 'INTERMEDIATE_1',
    title: 'Bài 3: Mục đích',
    summary: 'Diễn đạt mục đích của hành động.',
    points: [
      {
        title: '-기 위해(서)',
        meaning: 'Để (mục đích).',
        example: '건강을 위해서 운동해요.',
        translation: 'Tập thể dục để khỏe.',
      },
    ],
  },

  // --- Trung cấp 2 ---
  {
    level: 'INTERMEDIATE_2',
    title: 'Bài 1: Thời điểm và dự đoán',
    summary: 'Ngay khi, dù cố cũng vô ích.',
    points: [
      {
        title: '-는 대로',
        meaning: 'Ngay khi.',
        example: '도착하는 대로 전화할게요.',
        translation: 'Ngay khi đến sẽ gọi.',
      },
      {
        title: '-아/어 봤자',
        meaning: 'Dù… cũng (vô ích).',
        example: '말해 봤자 소용없어요.',
        translation: 'Nói cũng vô ích.',
      },
    ],
  },
  {
    level: 'INTERMEDIATE_2',
    title: 'Bài 2: Tham chiếu và lựa chọn',
    summary: 'Như đã biết, dù sao đi nữa.',
    points: [
      {
        title: '-다시피',
        meaning: 'Như (đã biết/thấy).',
        example: '아시다시피 한국은 사계절이 있어요.',
        translation: 'Như bạn biết, Hàn Quốc có 4 mùa.',
      },
      {
        title: '-든지',
        meaning: 'Dù gì đi nữa.',
        example: '비가 오든지 눈이 오든지 가야 해요.',
        translation: 'Dù mưa hay tuyết vẫn phải đi.',
      },
    ],
  },

  // --- Cao cấp 1 ---
  {
    level: 'ADVANCED_1',
    title: 'Bài 1: Diễn đạt cảm xúc và kết quả',
    summary: 'Nhấn mạnh, lý do dẫn đến kết quả tiêu cực.',
    points: [
      {
        title: '-(으)ㄹ 따름이다',
        meaning: 'Chỉ là (nhấn mạnh).',
        example: '감사드릴 따름입니다.',
        translation: 'Chỉ biết cảm ơn.',
      },
      {
        title: '-는 바람에',
        meaning: 'Vì (kết quả tiêu cực).',
        example: '버스를 놓치는 바람에 지각했어요.',
        translation: 'Vì lỡ xe buýt nên đến trễ.',
      },
    ],
  },
  {
    level: 'ADVANCED_1',
    title: 'Bài 2: So sánh tỉ lệ',
    summary: 'Tương ứng giữa hai vế.',
    points: [
      {
        title: '-(으)ㄴ/는 만큼',
        meaning: 'Chừng nào, bấy nhiêu.',
        example: '노력한 만큼 성공할 거예요.',
        translation: 'Cố gắng bao nhiêu sẽ thành công bấy nhiêu.',
      },
    ],
  },

  // --- Cao cấp 2 ---
  {
    level: 'ADVANCED_2',
    title: 'Bài 1: Khái quát và bổ sung',
    summary: 'Xem như, không chỉ… mà còn…',
    points: [
      {
        title: '-(으)ㄴ/는 셈이다',
        meaning: 'Xem như là.',
        example: '거의 끝난 셈이에요.',
        translation: 'Xem như đã xong.',
      },
      {
        title: '-(으)ㄹ뿐더러',
        meaning: 'Không chỉ.',
        example: '똑똑할뿐더러 성격도 좋아요.',
        translation: 'Không chỉ thông minh mà tính cách cũng tốt.',
      },
    ],
  },
  {
    level: 'ADVANCED_2',
    title: 'Bài 2: Lẽ tự nhiên',
    summary: 'Diễn đạt sự việc tất yếu.',
    points: [
      {
        title: '-기 마련이다',
        meaning: 'Lẽ tự nhiên.',
        example: '사람은 늙기 마련이에요.',
        translation: 'Con người già đi là lẽ tự nhiên.',
      },
    ],
  },
];

async function seedTopics() {
  const existing = await prisma.vocabularyTopic.count();
  if (existing > 0) {
    console.log(
      `Đã có ${existing} chủ đề, bỏ qua seed chủ đề.`,
    );
    return;
  }

  for (const topic of SEED_TOPICS) {
    await prisma.vocabularyTopic.create({
      data: {
        title: topic.title,
        description: topic.description,
        languageCode: topic.languageCode,
        level: topic.level,
        sortOrder: topic.sortOrder,
        words: {
          create: topic.words.map((w, i) => ({
            frontText: w.frontText,
            backText: w.backText,
            note: w.note,
            sortOrder: i,
          })),
        },
      },
    });
  }
  console.log(`Đã seed ${SEED_TOPICS.length} chủ đề.`);
}

async function seedGrammar() {
  const existing = await prisma.grammarLesson.count();
  if (existing > 0) {
    console.log(
      `Đã có ${existing} bài ngữ pháp, bỏ qua seed ngữ pháp.`,
    );
    return;
  }

  let totalPoints = 0;
  const perLevelCounter: Record<string, number> = {};
  for (const lesson of SEED_GRAMMAR_LESSONS) {
    const lessonOrder = perLevelCounter[lesson.level] ?? 0;
    perLevelCounter[lesson.level] = lessonOrder + 1;
    await prisma.grammarLesson.create({
      data: {
        level: lesson.level,
        title: lesson.title,
        summary: lesson.summary,
        sortOrder: lessonOrder,
        points: {
          create: lesson.points.map((p, i) => ({
            title: p.title,
            meaning: p.meaning,
            structure: p.structure,
            example: p.example,
            translation: p.translation,
            note: p.note,
            sortOrder: i,
          })),
        },
      },
    });
    totalPoints += lesson.points.length;
  }
  console.log(
    `Đã seed ${SEED_GRAMMAR_LESSONS.length} bài ngữ pháp (${totalPoints} điểm).`,
  );
}

async function main() {
  await seedTopics();
  await seedGrammar();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
