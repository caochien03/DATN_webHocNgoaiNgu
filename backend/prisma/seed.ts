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

type SeedGrammarExercise = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

type SeedGrammarLesson = {
  level: GrammarLevel;
  title: string;
  summary?: string;
  points: SeedGrammarPoint[];
  exercises?: SeedGrammarExercise[];
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
    exercises: [
      {
        prompt: '저는 학생___.',
        options: ['이에요', '예요', '이에요가', '예요는'],
        correctIndex: 0,
        explanation: '학생 kết thúc bằng phụ âm ㅇ nên dùng 이에요.',
      },
      {
        prompt: '사과___ 맛있어요.',
        options: ['을', '를', '이', '가'],
        correctIndex: 3,
        explanation: '사과 kết thúc bằng nguyên âm ㅏ, chủ ngữ dùng 가.',
      },
      {
        prompt: '제 친구___ 학생이에요.',
        options: ['은', '는', '이', '가'],
        correctIndex: 1,
        explanation: '친구 kết thúc bằng nguyên âm, chủ đề dùng 는.',
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
    exercises: [
      {
        prompt: '저는 밥___ 먹어요.',
        options: ['을', '를', '이', '가'],
        correctIndex: 0,
        explanation: '밥 kết thúc bằng phụ âm → tân ngữ dùng 을.',
      },
      {
        prompt: '저는 한국어를 ___.',
        options: ['공부하요', '공부해요', '공부하다', '공부합'],
        correctIndex: 1,
        explanation: '하다 → 해요; phần còn lại là dạng sai.',
      },
      {
        prompt: '감사___. (trang trọng)',
        options: ['합니다', '합니까', '해요', '해'],
        correctIndex: 0,
        explanation: 'Dạng trang trọng khẳng định dùng -ㅂ니다/-습니다.',
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
    exercises: [
      {
        prompt: '저는 밥을 먹___ 물을 마셔요.',
        options: ['고', '지만', '서', '면'],
        correctIndex: 0,
        explanation: '“và” nối hai hành động dùng -고.',
      },
      {
        prompt: '한국어는 재미있___ 어려워요.',
        options: ['고', '지만', '면', '은'],
        correctIndex: 1,
        explanation: '“nhưng” đối lập dùng -지만.',
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
    exercises: [
      {
        prompt: '여기 이름을 써 ___.',
        options: ['주세요', '주시요', '줬어요', '줘'],
        correctIndex: 0,
        explanation: 'Đề nghị lịch sự dùng -아/어 주세요.',
      },
      {
        prompt: '내일 친구를 만날 ___.',
        options: ['거예요', '가요', '했어요', '했다'],
        correctIndex: 0,
        explanation: 'Tương lai: -(으)ㄹ 거예요.',
      },
      {
        prompt: '이 음식을 한번 ___.',
        options: ['먹어 보세요', '먹다', '먹으세요', '먹겠다'],
        correctIndex: 0,
        explanation: '“Thử” dùng -아/어 보다 + 세요.',
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
    exercises: [
      {
        prompt: '배가 고프___ 밥을 먹어요.',
        options: ['니까', '으니까', '서', '는데'],
        correctIndex: 0,
        explanation: 'Gốc 고프 kết thúc bằng nguyên âm → dùng 니까 (không 으).',
      },
      {
        prompt: '교실에서 담배를 피우___ 마세요.',
        options: ['지', '는', '고', '아'],
        correctIndex: 0,
        explanation: 'Cấu trúc -지 말다: V + 지 말다.',
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
    exercises: [
      {
        prompt: '지금 먹___ 음식은 무엇이에요?',
        options: ['는', '은', '을', '던'],
        correctIndex: 0,
        explanation: 'Định ngữ hiện tại của động từ dùng -는.',
      },
      {
        prompt: '어제 먹___ 음식이 맛있었어요.',
        options: ['은', '는', '을', '아'],
        correctIndex: 0,
        explanation: 'Định ngữ quá khứ của động từ dùng -(으)ㄴ.',
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
    exercises: [
      {
        prompt: '밥을 먹___ TV를 봐요.',
        options: ['으면서', '면서', '고', '지만'],
        correctIndex: 0,
        explanation: 'Gốc 먹 kết thúc bằng phụ âm → dùng 으면서.',
      },
      {
        prompt: '한국어는 쉬운 ___.',
        options: ['편이에요', '거예요', '것이에요', '때예요'],
        correctIndex: 0,
        explanation: 'Cấu trúc “thuộc loại”: -(으)ㄴ/는 편이다.',
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
    exercises: [
      {
        prompt: '여기에서 사진을 찍___ 돼요.',
        options: ['어도', '아도', '으면', '도'],
        correctIndex: 0,
        explanation: '찍다 → gốc 찍, nguyên âm gốc là ㅣ → 어도.',
      },
      {
        prompt: '학생은 숙제를 ___ 돼요.',
        options: ['해야', '하야', '하아야', '하어야'],
        correctIndex: 0,
        explanation: '하다 → 해야 돼요 (dạng “phải làm”).',
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
    exercises: [
      {
        prompt: '한국어를 배우___ 한국에 왔어요.',
        options: ['기 위해서', '기 때문에', '러', '고'],
        correctIndex: 0,
        explanation: 'Mục đích dài lâu dùng -기 위해(서).',
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
    exercises: [
      {
        prompt: '집에 도착하___ 연락할게요.',
        options: ['는 대로', '면', '자마자', '고 나서'],
        correctIndex: 0,
        explanation: '“Ngay khi” (tức thời sau khi làm xong) dùng -는 대로.',
      },
      {
        prompt: '말해 ___ 아무 소용없어요.',
        options: ['봤자', '보니까', '보고', '봤지만'],
        correctIndex: 0,
        explanation: '-아/어 봤자: dù có… cũng vô ích.',
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
    exercises: [
      {
        prompt: '아시___ 한국의 겨울은 춥습니다.',
        options: ['다시피', '기 때문에', '고', '으니까'],
        correctIndex: 0,
        explanation: '“Như ai đó đã biết/thấy” dùng -다시피.',
      },
      {
        prompt: '비가 오___ 눈이 오___ 갈 거예요.',
        options: ['든지 든지', '지만 지만', '으면 으면', '는지 는지'],
        correctIndex: 0,
        explanation: '-든지 -든지 diễn đạt “dù là…hay là…cũng”.',
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
    exercises: [
      {
        prompt: '도와주셔서 감사___ 따름입니다.',
        options: ['할', '한', '하는', '하기'],
        correctIndex: 0,
        explanation: '-(으)ㄹ 따름이다 → V-(으)ㄹ (định ngữ tương lai).',
      },
      {
        prompt: '차가 막히___ 바람에 늦었어요.',
        options: ['는', '은', '을', '아서'],
        correctIndex: 0,
        explanation: '-는 바람에 dùng với định ngữ hiện tại -는.',
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
    exercises: [
      {
        prompt: '노력한 ___ 결과가 나와요.',
        options: ['만큼', '때문에', '후에', '동안'],
        correctIndex: 0,
        explanation: '-(으)ㄴ/는 만큼 thể hiện tỉ lệ tương ứng.',
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
    exercises: [
      {
        prompt: '일이 거의 끝난 ___.',
        options: ['셈이에요', '까닭이에요', '만이에요', '뿐이에요'],
        correctIndex: 0,
        explanation: '-(으)ㄴ/는 셈이다 = xem như là.',
      },
      {
        prompt: '그녀는 예쁠___ 똑똑하기도 해요.',
        options: ['뿐더러', '뿐만', '지만', '때문에'],
        correctIndex: 0,
        explanation: '-(으)ㄹ뿐더러 = không chỉ… mà còn…',
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
    exercises: [
      {
        prompt: '사람은 실수___ 마련이에요.',
        options: ['하기', '하는', '한', '할'],
        correctIndex: 0,
        explanation: '-기 마련이다 = V-기 + 마련이다.',
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
  const lessonCount = await prisma.grammarLesson.count();

  if (lessonCount === 0) {
    let totalPoints = 0;
    let totalExercises = 0;
    const perLevelCounter: Record<string, number> = {};
    for (const lesson of SEED_GRAMMAR_LESSONS) {
      const lessonOrder = perLevelCounter[lesson.level] ?? 0;
      perLevelCounter[lesson.level] = lessonOrder + 1;
      const created = await prisma.grammarLesson.create({
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

      if (lesson.exercises && lesson.exercises.length > 0) {
        await prisma.grammarExercise.createMany({
          data: lesson.exercises.map((e, i) => ({
            lessonId: created.id,
            prompt: e.prompt,
            options: e.options,
            correctIndex: e.correctIndex,
            explanation: e.explanation,
            sortOrder: i,
          })),
        });
        totalExercises += lesson.exercises.length;
      }
    }
    console.log(
      `Đã seed ${SEED_GRAMMAR_LESSONS.length} bài (${totalPoints} điểm, ${totalExercises} bài tập).`,
    );
    return;
  }

  const exerciseCount = await prisma.grammarExercise.count();
  if (exerciseCount > 0) {
    console.log(
      `Đã có ${lessonCount} bài và ${exerciseCount} bài tập, bỏ qua seed.`,
    );
    return;
  }

  let attached = 0;
  for (const seedLesson of SEED_GRAMMAR_LESSONS) {
    if (!seedLesson.exercises || seedLesson.exercises.length === 0) continue;
    const lesson = await prisma.grammarLesson.findFirst({
      where: { level: seedLesson.level, title: seedLesson.title },
    });
    if (!lesson) continue;
    await prisma.grammarExercise.createMany({
      data: seedLesson.exercises.map((e, i) => ({
        lessonId: lesson.id,
        prompt: e.prompt,
        options: e.options,
        correctIndex: e.correctIndex,
        explanation: e.explanation,
        sortOrder: i,
      })),
    });
    attached += seedLesson.exercises.length;
  }
  console.log(
    `Đã có ${lessonCount} bài ngữ pháp; gắn thêm ${attached} bài tập vào các bài có sẵn.`,
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
