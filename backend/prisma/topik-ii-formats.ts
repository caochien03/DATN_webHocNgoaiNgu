import { TopikSection, TopikTier } from '@prisma/client';
import type { TopikFormatSeed } from './topik-i-formats';

/** Ma trận dạng bài TOPIK II (mẫu — bổ sung dần khi có đề thật). */
export const TOPIK_II_FORMATS: TopikFormatSeed[] = [
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.LISTENING,
    fromNo: 1,
    toNo: 4,
    title: 'Chọn câu trả lời phù hợp',
    titleKo: '물음에 맞는 대답 고르기',
    sortOrder: 1,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.READING,
    fromNo: 1,
    toNo: 4,
    title: 'Chọn từ điền vào chỗ trống',
    titleKo: '( )에 들어갈 가장 알맞은 것',
    sortOrder: 1,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.WRITING,
    fromNo: 51,
    toNo: 52,
    title: 'Điền vào chỗ trống (㉠, ㉡)',
    titleKo: '㉠, ㉡에 들어갈 말 쓰기',
    description: 'Mỗi câu có 2 ý nhỏ cần viết.',
    sortOrder: 1,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.WRITING,
    fromNo: 53,
    toNo: 53,
    title: 'Viết đoạn văn ngắn',
    titleKo: '200~300자 쓰기',
    description: 'Mô tả biểu đồ hoặc nội dung cho trước.',
    sortOrder: 2,
  },
  {
    tier: TopikTier.TOPIK_II,
    section: TopikSection.WRITING,
    fromNo: 54,
    toNo: 54,
    title: 'Viết luận',
    titleKo: '600~700자 쓰기',
    description: 'Bài luận theo chủ đề.',
    sortOrder: 3,
  },
];
