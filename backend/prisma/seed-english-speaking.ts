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

const SEED_ENGLISH_SPEAKING: SpeakingTopicSeed[] = [
  {
    slug: 'cafe',
    title: 'Quán cafe',
    titleNative: 'Café',
    description: 'Gọi đồ uống, chọn size, mang đi hoặc uống tại quán.',
    sortOrder: 1,
    situations: [
      {
        slug: 'order-coffee',
        title: 'Gọi cà phê',
        topicSlug: 'cafe',
        contextVi:
          'Bạn vào quán cafe và gọi đồ uống. Nhân viên (barista) sẽ hỏi loại đồ, size và mang đi hay uống tại chỗ.',
        level: SpeakingSelfLevel.BEGINNER,
        userRoleVi: 'Khách hàng',
        npcRoleVi: 'Barista',
        openingLine: 'Hi! What can I get for you today?',
        goals: [
          { key: 'drink', labelVi: 'Loại đồ uống', required: true },
          { key: 'size', labelVi: 'Kích cỡ (small/medium/large)', required: true },
          {
            key: 'order_type',
            labelVi: 'Mang đi (to go) hay uống tại quán (for here)',
            required: true,
          },
        ],
        systemPrompt: `You are a friendly café barista in an English-speaking country.
- Speak only in English. Keep replies to 1–2 short sentences.
- Ask for any missing goal info: drink, size, for here or to go.
- Do not repeat questions for info the customer already gave.
- When all required goals are clear, confirm the order politely and wrap up.
- If the customer goes off-topic, gently steer back to taking the order.`,
        maxUserTurns: 5,
        sortOrder: 1,
      },
    ],
  },
  {
    slug: 'getting-around',
    title: 'Di chuyển',
    titleNative: 'Getting around',
    description: 'Hỏi đường, chỉ dẫn, cảm ơn.',
    sortOrder: 2,
    situations: [
      {
        slug: 'ask-directions',
        title: 'Hỏi đường',
        topicSlug: 'getting-around',
        contextVi:
          'Bạn đang ở nước nói tiếng Anh và cần hỏi người địa phương cách đến một địa điểm (ví dụ: ga tàu, bảo tàng).',
        level: SpeakingSelfLevel.BEGINNER,
        userRoleVi: 'Du khách',
        npcRoleVi: 'Người địa phương',
        openingLine: 'Sure, how can I help you?',
        goals: [
          { key: 'destination', labelVi: 'Nói rõ điểm đến', required: true },
          { key: 'direction', labelVi: 'Hiểu / nhận chỉ dẫn đường', required: true },
          { key: 'thanks', labelVi: 'Cảm ơn trước khi kết thúc', required: true },
        ],
        systemPrompt: `You are a helpful local helping a visitor with directions.
- Speak only in English. Use simple, clear phrases suitable for beginners.
- When you know the destination, give simple directions (go straight, turn left/right, how far).
- Do not ask again for the destination if the visitor already stated it.
- When the visitor thanks you, respond politely and end the conversation.`,
        maxUserTurns: 4,
        sortOrder: 1,
      },
    ],
  },
];

export async function seedEnglishSpeaking(prisma: PrismaClient): Promise<void> {
  for (const topicSeed of SEED_ENGLISH_SPEAKING) {
    const topicId = `seed-en-speaking-topic-${topicSeed.slug}`;

    const topic = await prisma.speakingTopic.upsert({
      where: { id: topicId },
      create: {
        id: topicId,
        title: topicSeed.title,
        titleNative: topicSeed.titleNative,
        description: topicSeed.description,
        languageCode: 'en',
        sortOrder: topicSeed.sortOrder,
        isPublished: true,
      },
      update: {
        title: topicSeed.title,
        titleNative: topicSeed.titleNative,
        description: topicSeed.description,
        languageCode: 'en',
        sortOrder: topicSeed.sortOrder,
        isPublished: true,
      },
    });

    for (const situationSeed of topicSeed.situations) {
      const situationId = `seed-en-speaking-situation-${situationSeed.slug}`;

      await prisma.speakingSituation.upsert({
        where: { id: situationId },
        create: {
          id: situationId,
          topicId: topic.id,
          languageCode: 'en',
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
          languageCode: 'en',
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

  const situationCount = SEED_ENGLISH_SPEAKING.reduce(
    (n, t) => n + t.situations.length,
    0,
  );
  console.log(
    `Đã seed luyện nói tiếng Anh: ${SEED_ENGLISH_SPEAKING.length} chủ đề, ${situationCount} tình huống.`,
  );
}
