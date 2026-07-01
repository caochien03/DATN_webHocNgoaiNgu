import {
  Prisma,
  PrismaClient,
  SpeakingSelfLevel,
} from '@prisma/client';

type SpeakingGoalSeed = {
  key: string;
  labelVi: string;
  required: boolean;
};

type SpeakingSituationSeed = {
  slug: string;
  title: string;
  topicSlug: string;
  contextVi: string;
  level: SpeakingSelfLevel;
  userRoleVi: string;
  npcRoleVi: string;
  openingLine: string;
  goals: SpeakingGoalSeed[];
  systemPrompt: string;
  maxUserTurns?: number;
  sortOrder: number;
};

type SpeakingTopicSeed = {
  slug: string;
  title: string;
  titleNative?: string;
  description?: string;
  sortOrder: number;
  situations: SpeakingSituationSeed[];
};

const SEED_SPEAKING: SpeakingTopicSeed[] = [
  {
    slug: 'food',
    title: 'Ẩm thực',
    titleNative: '음식',
    description: 'Gọi món, đặt bàn, nhà hàng.',
    sortOrder: 1,
    situations: [
      {
        slug: 'restaurant-reservation',
        title: 'Đặt bàn nhà hàng',
        topicSlug: 'food',
        contextVi:
          'Bạn gọi điện hoặc đến quầy để đặt bàn cho buổi tối. Nhân viên sẽ hỏi số người, thời gian và tên đặt bàn.',
        level: SpeakingSelfLevel.INTERMEDIATE,
        userRoleVi: 'Khách hàng',
        npcRoleVi: 'Nhân viên nhà hàng',
        openingLine: '안녕하세요, 예약 도와드릴게요. 몇 분이세요?',
        goals: [
          { key: 'party_size', labelVi: 'Số người', required: true },
          { key: 'date_time', labelVi: 'Ngày giờ đến', required: true },
          { key: 'name', labelVi: 'Tên đặt bàn', required: true },
          {
            key: 'special_request',
            labelVi: 'Yêu cầu đặc biệt (tuỳ chọn)',
            required: false,
          },
        ],
        systemPrompt: `Bạn là nhân viên nhà hàng Hàn Quốc, lịch sự và ngắn gọn.
- Chỉ nói tiếng Hàn.
- Mỗi lượt tối đa 1–2 câu.
- Hỏi thông tin còn thiếu trong mục tiêu: số người, ngày giờ, tên, yêu cầu đặc biệt.
- Không hỏi lại thông tin khách đã cung cấp.
- Khi đủ thông tin bắt buộc, xác nhận lại và kết thúc lịch sự.
- Nếu khách lạc đề, nhẹ nhàng kéo về chủ đề đặt bàn.`,
        maxUserTurns: 5,
        sortOrder: 1,
      },
    ],
  },
  {
    slug: 'travel',
    title: 'Du lịch',
    titleNative: '여행',
    description: 'Hỏi đường, giao thông, địa điểm.',
    sortOrder: 2,
    situations: [
      {
        slug: 'ask-directions-station',
        title: 'Hỏi đường đến ga tàu',
        topicSlug: 'travel',
        contextVi:
          'Bạn đang ở Hàn Quốc và cần hỏi người địa phương cách đến ga tàu gần nhất.',
        level: SpeakingSelfLevel.BEGINNER,
        userRoleVi: 'Du khách',
        npcRoleVi: 'Người địa phương',
        openingLine: '네, 무엇을 도와드릴까요?',
        goals: [
          { key: 'destination', labelVi: 'Nói rõ điểm đến (ga tàu)', required: true },
          { key: 'direction', labelVi: 'Hiểu / nhận chỉ dẫn đường', required: true },
          { key: 'thanks', labelVi: 'Cảm ơn trước khi kết thúc', required: true },
        ],
        systemPrompt: `Bạn là người Hàn Quốc thân thiện, giúp du khách hỏi đường.
- Chỉ nói tiếng Hàn, câu ngắn, phù hợp trình độ sơ cấp.
- Khi khách nói muốn đến ga tàu, chỉ đường đơn giản (đi thẳng, rẽ trái/phải, bao xa).
- Không hỏi lại điểm đến nếu khách đã nói rõ.
- Khi khách cảm ơn, trả lời lịch sự và kết thúc.`,
        maxUserTurns: 4,
        sortOrder: 1,
      },
    ],
  },
];

export async function seedSpeaking(prisma: PrismaClient): Promise<void> {
  for (const topicSeed of SEED_SPEAKING) {
    const topic = await prisma.speakingTopic.upsert({
      where: { id: `seed-speaking-topic-${topicSeed.slug}` },
      create: {
        id: `seed-speaking-topic-${topicSeed.slug}`,
        title: topicSeed.title,
        titleNative: topicSeed.titleNative,
        description: topicSeed.description,
        sortOrder: topicSeed.sortOrder,
        languageCode: 'ko',
        isPublished: true,
      },
      update: {
        title: topicSeed.title,
        titleNative: topicSeed.titleNative,
        description: topicSeed.description,
        sortOrder: topicSeed.sortOrder,
        languageCode: 'ko',
        isPublished: true,
      },
    });

    for (const situationSeed of topicSeed.situations) {
      await prisma.speakingSituation.upsert({
        where: { id: `seed-speaking-situation-${situationSeed.slug}` },
        create: {
          id: `seed-speaking-situation-${situationSeed.slug}`,
          topicId: topic.id,
          languageCode: 'ko',
          title: situationSeed.title,
          contextVi: situationSeed.contextVi,
          level: situationSeed.level,
          userRoleVi: situationSeed.userRoleVi,
          npcRoleVi: situationSeed.npcRoleVi,
          openingLine: situationSeed.openingLine,
          goals: situationSeed.goals as unknown as Prisma.InputJsonValue,
          systemPrompt: situationSeed.systemPrompt,
          maxUserTurns: situationSeed.maxUserTurns ?? 5,
          sortOrder: situationSeed.sortOrder,
          isPublished: true,
        },
        update: {
          topicId: topic.id,
          languageCode: 'ko',
          title: situationSeed.title,
          contextVi: situationSeed.contextVi,
          level: situationSeed.level,
          userRoleVi: situationSeed.userRoleVi,
          npcRoleVi: situationSeed.npcRoleVi,
          openingLine: situationSeed.openingLine,
          goals: situationSeed.goals as unknown as Prisma.InputJsonValue,
          systemPrompt: situationSeed.systemPrompt,
          maxUserTurns: situationSeed.maxUserTurns ?? 5,
          sortOrder: situationSeed.sortOrder,
          isPublished: true,
        },
      });
    }
  }

  const topicCount = SEED_SPEAKING.length;
  const situationCount = SEED_SPEAKING.reduce(
    (n, t) => n + t.situations.length,
    0,
  );
  console.log(
    `Đã seed luyện nói: ${topicCount} chủ đề, ${situationCount} tình huống.`,
  );
}
