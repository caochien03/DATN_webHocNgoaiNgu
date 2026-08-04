import {
  GrammarLevel,
  LearningPathStepType,
  Prisma,
  PrismaClient,
  SpeakingSelfLevel,
  ToeicSection,
  TopikQuestionType,
  TopikSection,
  TopikTier,
} from '@prisma/client';

/**
 * Học liệu gốc dùng cho môi trường demo/đồ án.
 * Nội dung được biên soạn mới, không trích chép đề TOPIK hoặc TOEIC phát hành.
 * Mọi bản ghi đều có ID tiền tố `seed-real-` để chạy lại an toàn.
 */

type Word = { slug: string; frontText: string; backText: string; note?: string };

const TOPICS: Array<{
  id: string;
  title: string;
  description: string;
  languageCode: string;
  level: string;
  sortOrder: number;
  words: Word[];
}> = [
  {
    id: 'seed-real-topic-ko-food',
    title: 'Ăn uống hằng ngày',
    description: 'Từ vựng thiết thực khi gọi món, mua đồ ăn và nói về khẩu vị.',
    languageCode: 'ko',
    level: 'TOPIK 1',
    sortOrder: 10,
    words: [
      ['음식', 'Đồ ăn', 'eum-sik'], ['식당', 'Nhà hàng', 'sik-dang'],
      ['메뉴', 'Thực đơn', 'me-nyu'], ['주문하다', 'Gọi món', 'ju-mun-ha-da'],
      ['물', 'Nước', 'mul'], ['밥', 'Cơm', 'bap'], ['국', 'Canh', 'guk'],
      ['고기', 'Thịt', 'go-gi'], ['채소', 'Rau củ', 'chae-so'],
      ['맛있다', 'Ngon', 'mat-it-da'], ['맵다', 'Cay', 'maep-da'],
      ['달다', 'Ngọt', 'dal-da'], ['배고프다', 'Đói bụng', 'bae-go-peu-da'],
      ['배부르다', 'No bụng', 'bae-bu-reu-da'], ['계산하다', 'Thanh toán', 'gye-san-ha-da'],
      ['포장하다', 'Gói mang về', 'po-jang-ha-da'], ['젓가락', 'Đũa', 'jeot-ga-rak'],
      ['숟가락', 'Thìa', 'sut-ga-rak'],
    ].map(([slug, frontText, backText]) => ({ slug, frontText, backText })),
  },
  {
    id: 'seed-real-topic-ko-daily-life',
    title: 'Sinh hoạt hằng ngày',
    description: 'Các động từ và cụm từ thông dụng trong lịch sinh hoạt.',
    languageCode: 'ko',
    level: 'TOPIK 1',
    sortOrder: 11,
    words: [
      ['일어나다', 'Thức dậy', 'il-eo-na-da'], ['씻다', 'Rửa / tắm', 'ssit-da'],
      ['아침', 'Buổi sáng / bữa sáng', 'a-chim'], ['출근하다', 'Đi làm', 'chul-geun-ha-da'],
      ['등교하다', 'Đi học', 'deung-gyo-ha-da'], ['공부하다', 'Học', 'gong-bu-ha-da'],
      ['쉬다', 'Nghỉ ngơi', 'swi-da'], ['운동하다', 'Tập thể dục', 'un-dong-ha-da'],
      ['장보다', 'Đi chợ', 'jang-bo-da'], ['청소하다', 'Dọn dẹp', 'cheong-so-ha-da'],
      ['빨래하다', 'Giặt quần áo', 'ppal-lae-ha-da'], ['만나다', 'Gặp gỡ', 'man-na-da'],
      ['저녁', 'Buổi tối / bữa tối', 'jeo-nyeok'], ['잠자다', 'Ngủ', 'jam-ja-da'],
      ['매일', 'Mỗi ngày', 'mae-il'], ['주말', 'Cuối tuần', 'ju-mal'],
      ['바쁘다', 'Bận', 'ba-ppeu-da'], ['피곤하다', 'Mệt', 'pi-gon-ha-da'],
    ].map(([slug, frontText, backText]) => ({ slug, frontText, backText })),
  },
  {
    id: 'seed-real-topic-en-workplace',
    title: 'Giao tiếp nơi công sở',
    description: 'Từ vựng tiếng Anh dùng trong họp, phối hợp công việc và email.',
    languageCode: 'en',
    level: 'B1',
    sortOrder: 10,
    words: [
      ['agenda', 'agenda', 'Chương trình cuộc họp'], ['attend', 'attend', 'Tham dự'],
      ['confirm', 'confirm', 'Xác nhận'], ['deadline', 'deadline', 'Hạn chót'],
      ['feedback', 'feedback', 'Phản hồi'], ['follow-up', 'follow up', 'Theo dõi / xử lý tiếp'],
      ['invoice', 'invoice', 'Hóa đơn'], ['minutes', 'meeting minutes', 'Biên bản cuộc họp'],
      ['negotiate', 'negotiate', 'Đàm phán'], ['priority', 'priority', 'Ưu tiên'],
      ['proposal', 'proposal', 'Đề xuất'], ['reschedule', 'reschedule', 'Dời lịch'],
      ['stakeholder', 'stakeholder', 'Bên liên quan'], ['update', 'update', 'Cập nhật'],
      ['workload', 'workload', 'Khối lượng công việc'], ['coordinate', 'coordinate', 'Phối hợp'],
    ].map(([slug, frontText, backText]) => ({ slug, frontText, backText })),
  },
];

const LESSONS = [
  {
    id: 'seed-real-lesson-ko-place-direction',
    languageCode: 'ko',
    level: GrammarLevel.BEGINNER_1,
    title: 'Bài bổ sung: Địa điểm và chỉ hướng',
    summary: 'Hỏi vị trí, nói phương hướng và khoảng cách bằng các mẫu câu sơ cấp.',
    sortOrder: 50,
    points: [
      ['에 있어요', 'Ở / có tại', 'N에 있어요', '은행은 역 앞에 있어요.', 'Ngân hàng ở trước ga tàu.'],
      ['(으)로 가다', 'Đi về hướng / bằng phương tiện', 'N(으)로 가요', '지하철로 학교에 가요.', 'Tôi đi tàu điện ngầm đến trường.'],
      ['에서', 'Tại nơi diễn ra hành động', 'N에서 V', '카페에서 친구를 만나요.', 'Tôi gặp bạn ở quán cà phê.'],
    ],
    exercises: [
      ['학교___ 공부해요.', ['에', '에서', '으로', '와'], 1, 'Hành động học diễn ra tại trường nên dùng 에서.'],
      ['은행은 역 앞___ 있어요.', ['을', '에', '에서', '로'], 1, 'Mẫu chỉ vị trí là N에 있어요.'],
      ['버스___ 회사에 가요.', ['에서', '으로', '를', '은'], 1, 'Phương tiện / hướng đi dùng (으)로.'],
    ],
  },
  {
    id: 'seed-real-lesson-ko-plan',
    languageCode: 'ko',
    level: GrammarLevel.BEGINNER_2,
    title: 'Bài bổ sung: Dự định và lời hẹn',
    summary: 'Diễn đạt kế hoạch gần và đưa ra lời hẹn đơn giản.',
    sortOrder: 51,
    points: [
      ['-(으)려고 하다', 'Dự định làm gì', 'V-(으)려고 해요', '주말에 영화를 보려고 해요.', 'Cuối tuần tôi định xem phim.'],
      ['-고 싶다', 'Muốn làm gì', 'V-고 싶어요', '한국 음식을 먹고 싶어요.', 'Tôi muốn ăn món Hàn.'],
      ['-(으)ㄹ까요?', 'Rủ rê / đề nghị', 'V-(으)ㄹ까요?', '같이 커피를 마실까요?', 'Chúng ta cùng uống cà phê nhé?'],
    ],
    exercises: [
      ['내일 친구를 만나___ 해요.', ['고', '려고', '지만', '에서'], 1, 'Muốn nói dự định dùng -(으)려고 하다.'],
      ['저는 한국에 가___ 싶어요.', ['고', '아', '을', '에서'], 0, 'Sau động từ, -고 싶어요 diễn đạt mong muốn.'],
      ['주말에 같이 운동하___?', ['어요', '고', 'ㄹ까요', '지만'], 2, 'Câu rủ rê dùng -(으)ㄹ까요?.'],
    ],
  },
];

const SPEAKING = [
  {
    id: 'seed-real-speaking-topic-ko-health', title: 'Sức khỏe', titleNative: '건강', languageCode: 'ko', sortOrder: 10,
    description: 'Đặt lịch khám và mô tả triệu chứng cơ bản.',
    situations: [{
      id: 'seed-real-speaking-ko-clinic', title: 'Đặt lịch khám', level: SpeakingSelfLevel.INTERMEDIATE,
      contextVi: 'Bạn gọi đến phòng khám để đặt lịch vì bị đau họng hai ngày. Nhân viên cần biết triệu chứng, ngày giờ mong muốn và tên của bạn.',
      userRoleVi: 'Bệnh nhân', npcRoleVi: 'Nhân viên phòng khám',
      openingLine: '안녕하세요, 내과입니다. 예약을 도와드릴까요?', maxUserTurns: 6,
      goals: [
        { key: 'symptom', labelVi: 'Nêu triệu chứng', required: true },
        { key: 'preferred_time', labelVi: 'Ngày hoặc giờ mong muốn', required: true },
        { key: 'name', labelVi: 'Tên người đặt lịch', required: true },
      ],
      systemPrompt: 'Bạn là nhân viên phòng khám tại Hàn Quốc. Chỉ nói tiếng Hàn, mỗi lượt 1–2 câu lịch sự. Hỏi lần lượt triệu chứng, thời gian mong muốn và tên nếu người học chưa nói. Khi đủ thông tin, nhắc lại lịch hẹn và kết thúc lịch sự.',
    }],
  },
  {
    id: 'seed-real-speaking-topic-en-hotel', title: 'Khách sạn', titleNative: 'Hotel', languageCode: 'en', sortOrder: 10,
    description: 'Làm thủ tục nhận phòng và trao đổi yêu cầu lưu trú.',
    situations: [{
      id: 'seed-real-speaking-en-checkin', title: 'Nhận phòng khách sạn', level: SpeakingSelfLevel.INTERMEDIATE,
      contextVi: 'Bạn đến khách sạn để nhận phòng đã đặt. Lễ tân cần tên đặt phòng, số đêm lưu trú và giấy tờ tùy thân.',
      userRoleVi: 'Khách lưu trú', npcRoleVi: 'Lễ tân khách sạn',
      openingLine: 'Good evening. Welcome to Riverside Hotel. How may I help you?', maxUserTurns: 6,
      goals: [
        { key: 'booking_name', labelVi: 'Tên đặt phòng', required: true },
        { key: 'stay_length', labelVi: 'Số đêm lưu trú', required: true },
        { key: 'id_document', labelVi: 'Xác nhận cung cấp giấy tờ', required: true },
      ],
      systemPrompt: 'You are a professional hotel receptionist. Speak only English in one or two concise sentences. Obtain the booking name, length of stay, and ID confirmation without repeating information. Once complete, confirm check-in details and politely finish.',
    }],
  },
];

type TopikQuestionSeed = {
  id: string; section: TopikSection; questionNo: number; questionType?: TopikQuestionType;
  prompt: string; passage?: string; options: string[]; correctIndex: number; explanation?: string;
  modelAnswer?: string; writingParts?: Prisma.InputJsonValue; minChars?: number; maxChars?: number; maxScore?: number; points?: number;
};

const TOPIK_II_QUESTIONS: TopikQuestionSeed[] = [
  { id: 'seed-real-topik-ii-l-3', section: TopikSection.LISTENING, questionNo: 3, prompt: '두 사람은 무엇에 대해 이야기하고 있습니까?', passage: '여자: 보고서 초안을 오늘까지 보내 주실 수 있나요?\n남자: 네, 검토한 후 오후에 이메일로 보내겠습니다.', options: ['회의 장소', '보고서 제출', '출장 일정', '제품 가격'], correctIndex: 1, explanation: 'Người nói trao đổi về việc gửi bản thảo báo cáo.', points: 2 },
  { id: 'seed-real-topik-ii-l-4', section: TopikSection.LISTENING, questionNo: 4, prompt: '남자의 생각으로 알맞은 것을 고르십시오.', passage: '남자: 처음에는 재택근무가 낯설었지만, 시간을 잘 계획하니까 업무에 더 집중할 수 있었습니다.', options: ['재택근무는 업무 집중을 방해한다.', '시간 계획이 재택근무에 도움이 된다.', '남자는 재택근무를 그만두었다.', '남자는 회사에서만 일하고 싶다.'], correctIndex: 1, explanation: '핵심은 시간 계획 후 업무 집중이 좋아졌다는 점이다.', points: 2 },
  { id: 'seed-real-topik-ii-l-5', section: TopikSection.LISTENING, questionNo: 5, prompt: '여자가 다음에 할 일로 알맞은 것을 고르십시오.', passage: '여자: 신청서를 작성했는데 첨부 파일을 빠뜨렸네요. 지금 바로 자료를 추가해서 다시 제출하겠습니다.', options: ['신청을 취소한다.', '자료를 추가해 다시 제출한다.', '담당자에게 전화를 건다.', '회의에 참석한다.'], correctIndex: 1, explanation: '첨부 자료를 추가해 재제출하겠다고 했다.', points: 2 },
  { id: 'seed-real-topik-ii-r-3', section: TopikSection.READING, questionNo: 3, prompt: '( )에 들어갈 가장 알맞은 것을 고르십시오.', passage: '새로운 서비스를 이용하기 전에 개인정보 처리 방침을 자세히 ( ) 것이 좋습니다.', options: ['확인하는', '확인하는지', '확인했던', '확인할까'], correctIndex: 0, explanation: 'V-는 것이 좋다: “làm việc gì thì tốt”.', points: 2 },
  { id: 'seed-real-topik-ii-r-4', section: TopikSection.READING, questionNo: 4, prompt: '글의 중심 생각을 고르십시오.', passage: '도시에서는 자전거 전용 도로를 늘리는 움직임이 커지고 있다. 자전거는 교통 체증과 대기 오염을 줄이는 데 도움이 되지만, 안전한 이용 환경도 함께 마련되어야 한다.', options: ['자전거는 도시에서 금지되어야 한다.', '자전거 이용 확대에는 안전한 환경이 필요하다.', '교통 체증은 해결할 수 없다.', '자동차 도로를 더 많이 만들어야 한다.'], correctIndex: 1, explanation: '자전거의 장점과 함께 안전한 인프라 필요성을 말한다.', points: 2 },
  { id: 'seed-real-topik-ii-r-5', section: TopikSection.READING, questionNo: 5, prompt: '다음 글의 내용과 같은 것을 고르십시오.', passage: '지역 도서관은 다음 달부터 평일 저녁 9시까지 운영 시간을 연장한다. 주말 운영 시간은 이전과 같다. 연장된 시간에는 자료 대출과 반납만 가능하다.', options: ['주말 운영 시간도 늘어난다.', '평일 저녁에는 모든 서비스를 이용할 수 있다.', '다음 달부터 평일 저녁 9시까지 이용할 수 있다.', '도서관은 다음 달에 문을 닫는다.'], correctIndex: 2, explanation: '평일에만 연장하고, 연장 시간에는 대출·반납만 가능하다.', points: 2 },
  { id: 'seed-real-topik-ii-w-51', section: TopikSection.WRITING, questionNo: 51, questionType: TopikQuestionType.SHORT_ANSWER, prompt: '㉠, ㉡에 들어갈 말을 각각 쓰십시오.', passage: '가: 내일 회의에 참석할 수 있어요?\n나: 네, 일정이 없어서 (㉠). 자료도 미리 (㉡).', options: [], correctIndex: 0, writingParts: [{ label: '㉠', modelAnswer: '참석할 수 있어요', maxScore: 5 }, { label: '㉡', modelAnswer: '준비하겠습니다', maxScore: 5 }] as unknown as Prisma.InputJsonValue, maxScore: 10, points: 10 },
  { id: 'seed-real-topik-ii-w-52', section: TopikSection.WRITING, questionNo: 52, questionType: TopikQuestionType.SHORT_ANSWER, prompt: '다음 안내문을 완성하십시오.', passage: '도서관 내부 공사로 인해 8월 3일에는 열람실을 이용할 수 없습니다. 자료 대출과 반납은 1층 안내 데스크에서 가능합니다.\n[안내] 8월 3일, 열람실 (㉠). 자료 대출·반납은 (㉡).', options: [], correctIndex: 0, writingParts: [{ label: '㉠', modelAnswer: '이용 불가', maxScore: 5 }, { label: '㉡', modelAnswer: '1층 안내 데스크', maxScore: 5 }] as unknown as Prisma.InputJsonValue, maxScore: 10, points: 10 },
  { id: 'seed-real-topik-ii-w-53', section: TopikSection.WRITING, questionNo: 53, questionType: TopikQuestionType.ESSAY, prompt: '다음 주제에 대해 200~300자로 쓰십시오.', passage: '여러분이 시간을 효율적으로 관리하는 방법과 그 효과를 쓰십시오.', options: [], correctIndex: 0, minChars: 200, maxChars: 300, maxScore: 30, points: 30, modelAnswer: '저는 매주 해야 할 일을 중요도에 따라 정리합니다. 먼저 마감 기한이 가까운 일을 하고, 큰 과제는 작은 단계로 나눕니다. 이렇게 하면 해야 할 일을 잊지 않고 휴식 시간도 계획할 수 있습니다. 그 결과 스트레스를 줄이고 공부와 일을 더 꾸준히 할 수 있었습니다.' },
];

type ToeicQuestionSeed = { id: string; section: ToeicSection; questionNo: number; prompt: string; passage?: string; options: string[]; correctIndex: number; explanation?: string; bundleId?: string };
const TOEIC_QUESTIONS: ToeicQuestionSeed[] = [
  { id: 'seed-real-toeic-l-8', section: ToeicSection.LISTENING, questionNo: 8, prompt: 'When will the maintenance work begin?', passage: 'Woman: When will the maintenance work begin?\nMan: It is scheduled for Thursday morning.', options: ['On Tuesday morning', 'On Thursday morning', 'This afternoon', 'Next weekend'], correctIndex: 1, explanation: 'Thursday morning được nêu trực tiếp trong câu trả lời.' },
  { id: 'seed-real-toeic-l-9', section: ToeicSection.LISTENING, questionNo: 9, prompt: 'Who is responsible for the client presentation?', passage: 'Man: Who is responsible for the client presentation?\nWoman: Ms. Patel will lead it this time.', options: ['The client', 'Ms. Patel', 'The manager', 'The receptionist'], correctIndex: 1 },
  { id: 'seed-real-toeic-l-34', section: ToeicSection.LISTENING, questionNo: 34, prompt: 'What are the speakers mainly discussing?', passage: 'Woman: The conference room is already booked at two.\nMan: Then let’s move our training session to the smaller room at three.\nWoman: I’ll notify the participants.', options: ['A room change for a training session', 'A new employee orientation', 'A catering order', 'A travel reservation'], correctIndex: 0, bundleId: 'seed-real-toeic-l-34-36' },
  { id: 'seed-real-toeic-l-35', section: ToeicSection.LISTENING, questionNo: 35, prompt: 'When will the training session take place?', passage: 'Woman: The conference room is already booked at two.\nMan: Then let’s move our training session to the smaller room at three.\nWoman: I’ll notify the participants.', options: ['At 2 p.m.', 'At 3 p.m.', 'Tomorrow morning', 'Next week'], correctIndex: 1, bundleId: 'seed-real-toeic-l-34-36' },
  { id: 'seed-real-toeic-l-36', section: ToeicSection.LISTENING, questionNo: 36, prompt: 'What will the woman most likely do next?', passage: 'Woman: The conference room is already booked at two.\nMan: Then let’s move our training session to the smaller room at three.\nWoman: I’ll notify the participants.', options: ['Reserve a hotel', 'Send a notice to attendees', 'Prepare refreshments', 'Cancel the training'], correctIndex: 1, bundleId: 'seed-real-toeic-l-34-36' },
  { id: 'seed-real-toeic-r-4', section: ToeicSection.READING, questionNo: 4, prompt: 'The accountant will _____ the invoices before noon.', options: ['review', 'reviews', 'reviewed', 'reviewing'], correctIndex: 0, explanation: 'Sau will dùng động từ nguyên mẫu.' },
  { id: 'seed-real-toeic-r-5', section: ToeicSection.READING, questionNo: 5, prompt: 'Please contact Ms. Green _____ you have any questions about the contract.', options: ['unless', 'if', 'although', 'while'], correctIndex: 1, explanation: 'If diễn đạt điều kiện “nếu có câu hỏi”.' },
  { id: 'seed-real-toeic-r-6', section: ToeicSection.READING, questionNo: 6, prompt: 'The museum is closed on Mondays _____ public holidays.', options: ['and', 'but', 'or', 'so'], correctIndex: 2, explanation: '“Mondays or public holidays” là hai trường hợp thay thế.' },
  { id: 'seed-real-toeic-r-34', section: ToeicSection.READING, questionNo: 34, prompt: 'Which word best completes the notice?', passage: 'All staff members are _____ to attend the safety briefing at 9:00 a.m. on Friday.', options: ['required', 'requiring', 'requirement', 'requires'], correctIndex: 0, explanation: 'Cấu trúc be required to + V.' },
  { id: 'seed-real-toeic-r-35', section: ToeicSection.READING, questionNo: 35, prompt: 'Which sentence best completes the notice?', passage: 'All staff members are required to attend the safety briefing at 9:00 a.m. on Friday. _____.', options: ['The briefing will be held in Meeting Room B.', 'The new menu was popular with visitors.', 'Please submit your travel receipts.', 'The office moved last year.'], correctIndex: 0, explanation: 'Câu bổ sung hợp lý phải tiếp tục cung cấp thông tin về buổi phổ biến an toàn.' },
  { id: 'seed-real-toeic-r-50', section: ToeicSection.READING, questionNo: 50, prompt: 'Why was the e-mail written?', passage: 'Subject: Delivery update\n\nDear Ms. Tran,\nYour order will arrive one day later than planned because of heavy rain in the northern region. We apologize for the inconvenience and will send a tracking link this afternoon.\n\nBest regards,\nNorthline Logistics', options: ['To announce a delayed delivery', 'To request a new order', 'To advertise a discount', 'To confirm a job interview'], correctIndex: 0, bundleId: 'seed-real-toeic-r-50-52' },
  { id: 'seed-real-toeic-r-51', section: ToeicSection.READING, questionNo: 51, prompt: 'What will the company do this afternoon?', passage: 'Subject: Delivery update\n\nDear Ms. Tran,\nYour order will arrive one day later than planned because of heavy rain in the northern region. We apologize for the inconvenience and will send a tracking link this afternoon.\n\nBest regards,\nNorthline Logistics', options: ['Deliver the order', 'Send a tracking link', 'Cancel the shipment', 'Offer a refund'], correctIndex: 1, bundleId: 'seed-real-toeic-r-50-52' },
  { id: 'seed-real-toeic-r-52', section: ToeicSection.READING, questionNo: 52, prompt: 'What is implied about the original delivery date?', passage: 'Subject: Delivery update\n\nDear Ms. Tran,\nYour order will arrive one day later than planned because of heavy rain in the northern region. We apologize for the inconvenience and will send a tracking link this afternoon.\n\nBest regards,\nNorthline Logistics', options: ['It was yesterday.', 'It was changed by the customer.', 'It was expected before the revised date.', 'It was never scheduled.'], correctIndex: 2, bundleId: 'seed-real-toeic-r-50-52' },
];

export async function seedRealContent(prisma: PrismaClient): Promise<void> {
  for (const topicSeed of TOPICS) {
    await prisma.vocabularyTopic.upsert({
      where: { id: topicSeed.id },
      create: { ...topicSeed, words: undefined },
      update: { title: topicSeed.title, description: topicSeed.description, languageCode: topicSeed.languageCode, level: topicSeed.level, sortOrder: topicSeed.sortOrder },
    });
    for (const [index, word] of topicSeed.words.entries()) {
      await prisma.vocabularyWord.upsert({
        where: { id: `${topicSeed.id}-word-${word.slug}` },
        create: { id: `${topicSeed.id}-word-${word.slug}`, topicId: topicSeed.id, frontText: word.frontText, backText: word.backText, note: word.note, sortOrder: index + 1 },
        update: { frontText: word.frontText, backText: word.backText, note: word.note, sortOrder: index + 1 },
      });
    }
  }

  for (const lesson of LESSONS) {
    await prisma.grammarLesson.upsert({
      where: { id: lesson.id },
      create: { id: lesson.id, level: lesson.level, title: lesson.title, summary: lesson.summary, languageCode: lesson.languageCode, sortOrder: lesson.sortOrder },
      update: { level: lesson.level, title: lesson.title, summary: lesson.summary, languageCode: lesson.languageCode, sortOrder: lesson.sortOrder },
    });
    for (const [index, point] of lesson.points.entries()) {
      await prisma.grammarPoint.upsert({
        where: { id: `${lesson.id}-point-${index + 1}` },
        create: { id: `${lesson.id}-point-${index + 1}`, lessonId: lesson.id, title: point[0], meaning: point[1], structure: point[2], example: point[3], translation: point[4], sortOrder: index + 1 },
        update: { title: point[0], meaning: point[1], structure: point[2], example: point[3], translation: point[4], sortOrder: index + 1 },
      });
    }
    for (const [index, exercise] of lesson.exercises.entries()) {
      await prisma.grammarExercise.upsert({
        where: { id: `${lesson.id}-exercise-${index + 1}` },
        create: { id: `${lesson.id}-exercise-${index + 1}`, lessonId: lesson.id, prompt: exercise[0], options: exercise[1], correctIndex: exercise[2], explanation: exercise[3], sortOrder: index + 1 },
        update: { prompt: exercise[0], options: exercise[1], correctIndex: exercise[2], explanation: exercise[3], sortOrder: index + 1 },
      });
    }
  }

  const pathId = 'seed-real-path-ko-daily-life';
  await prisma.learningPath.upsert({
    where: { id: pathId },
    create: { id: pathId, title: 'Tiếng Hàn sơ cấp: Sinh hoạt hằng ngày', description: 'Lộ trình ngắn kết hợp từ vựng, ngữ pháp và luyện tập giao tiếp.', languageCode: 'ko', level: 'TOPIK 1', sortOrder: 10 },
    update: { title: 'Tiếng Hàn sơ cấp: Sinh hoạt hằng ngày', description: 'Lộ trình ngắn kết hợp từ vựng, ngữ pháp và luyện tập giao tiếp.', languageCode: 'ko', level: 'TOPIK 1', sortOrder: 10 },
  });
  const steps = [
    { type: LearningPathStepType.TOPIC, title: 'Từ vựng: Sinh hoạt hằng ngày', summary: 'Nắm các hoạt động và thời điểm quen thuộc.', topicId: 'seed-real-topic-ko-daily-life' },
    { type: LearningPathStepType.LESSON, title: 'Ngữ pháp: Địa điểm và chỉ hướng', summary: 'Nói nơi chốn và phương tiện di chuyển.', lessonId: 'seed-real-lesson-ko-place-direction' },
    { type: LearningPathStepType.TOPIC, title: 'Từ vựng: Ăn uống hằng ngày', summary: 'Gọi món và trao đổi khẩu vị cơ bản.', topicId: 'seed-real-topic-ko-food' },
    { type: LearningPathStepType.LESSON, title: 'Ngữ pháp: Dự định và lời hẹn', summary: 'Lập kế hoạch, rủ rê và trả lời lời hẹn.', lessonId: 'seed-real-lesson-ko-plan' },
  ];
  for (const [index, step] of steps.entries()) {
    await prisma.learningPathStep.upsert({
      where: { id: `${pathId}-step-${index + 1}` },
      create: { id: `${pathId}-step-${index + 1}`, pathId, ...step, sortOrder: index + 1 },
      update: { ...step, sortOrder: index + 1 },
    });
  }

  for (const topic of SPEAKING) {
    await prisma.speakingTopic.upsert({
      where: { id: topic.id },
      create: { id: topic.id, title: topic.title, titleNative: topic.titleNative, languageCode: topic.languageCode, description: topic.description, sortOrder: topic.sortOrder, isPublished: true },
      update: { title: topic.title, titleNative: topic.titleNative, languageCode: topic.languageCode, description: topic.description, sortOrder: topic.sortOrder, isPublished: true },
    });
    for (const situation of topic.situations) {
      await prisma.speakingSituation.upsert({
        where: { id: situation.id },
        create: { ...situation, topicId: topic.id, languageCode: topic.languageCode, goals: situation.goals as unknown as Prisma.InputJsonValue, isPublished: true },
        update: { ...situation, topicId: topic.id, languageCode: topic.languageCode, goals: situation.goals as unknown as Prisma.InputJsonValue, isPublished: true },
      });
    }
  }

  const topikExamId = 'seed-real-topik-ii-practice-a';
  await prisma.topikExam.upsert({
    where: { id: topikExamId },
    create: { id: topikExamId, title: 'TOPIK II — Bài luyện tổng hợp A', description: 'Bộ câu hỏi tự biên soạn: nghe, đọc và viết theo các dạng cơ bản.', tier: TopikTier.TOPIK_II, durationMinutes: 70, isPublished: true, sortOrder: 10 },
    update: { title: 'TOPIK II — Bài luyện tổng hợp A', description: 'Bộ câu hỏi tự biên soạn: nghe, đọc và viết theo các dạng cơ bản.', durationMinutes: 70, isPublished: true, sortOrder: 10 },
  });
  for (const question of TOPIK_II_QUESTIONS) {
    await prisma.topikQuestion.upsert({
      where: { id: question.id },
      create: { ...question, tier: TopikTier.TOPIK_II, isPublished: true },
      update: { ...question, tier: TopikTier.TOPIK_II, isPublished: true },
    });
  }
  await prisma.topikExamQuestion.deleteMany({ where: { examId: topikExamId } });
  await prisma.topikExamQuestion.createMany({ data: TOPIK_II_QUESTIONS.map((question, index) => ({ examId: topikExamId, questionId: question.id, sortOrder: index + 1 })) });

  const toeicExamId = 'seed-real-toeic-practice-a';
  await prisma.toeicExam.upsert({
    where: { id: toeicExamId },
    create: { id: toeicExamId, title: 'TOEIC LR — Bài luyện thực hành A', description: 'Bộ câu hỏi tự biên soạn cho các Part 2, 3, 5, 6 và 7.', durationMinutes: 45, isPublished: true, sortOrder: 10 },
    update: { title: 'TOEIC LR — Bài luyện thực hành A', description: 'Bộ câu hỏi tự biên soạn cho các Part 2, 3, 5, 6 và 7.', durationMinutes: 45, isPublished: true, sortOrder: 10 },
  });
  for (const question of TOEIC_QUESTIONS) {
    await prisma.toeicQuestion.upsert({
      where: { id: question.id },
      create: { ...question, isPublished: true },
      update: { ...question, isPublished: true },
    });
  }
  await prisma.toeicExamQuestion.deleteMany({ where: { examId: toeicExamId } });
  await prisma.toeicExamQuestion.createMany({ data: TOEIC_QUESTIONS.map((question, index) => ({ examId: toeicExamId, questionId: question.id, sortOrder: index + 1 })) });

  console.log(`Đã seed học liệu gốc: ${TOPICS.length} chủ đề từ vựng, ${LESSONS.length} bài ngữ pháp, 1 lộ trình, ${SPEAKING.length} chủ đề luyện nói, ${TOPIK_II_QUESTIONS.length} câu TOPIK II và ${TOEIC_QUESTIONS.length} câu TOEIC.`);
}
