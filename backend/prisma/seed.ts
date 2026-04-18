import { PrismaClient } from '@prisma/client';

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

async function main() {
  const existing = await prisma.vocabularyTopic.count();
  if (existing > 0) {
    console.log(
      `Đã có ${existing} chủ đề trong DB, bỏ qua seed để không nhân bản.`,
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
  console.log(`Đã seed ${SEED_TOPICS.length} chủ đề mẫu.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
