import { ToeicSection, ToeicTier } from '@prisma/client';

export type ToeicFormatSeed = {
  tier: ToeicTier;
  section: ToeicSection;
  part: number;
  fromNo: number;
  toNo: number;
  title: string;
  titleEn: string;
  description?: string;
  sortOrder: number;
};

/** Ma trận Part TOEIC Listening & Reading (LR). */
export const TOEIC_LR_FORMATS: ToeicFormatSeed[] = [
  {
    tier: ToeicTier.TOEIC_LR,
    section: ToeicSection.LISTENING,
    part: 1,
    fromNo: 1,
    toNo: 6,
    title: 'Mô tả tranh',
    titleEn: 'Photographs',
    description: 'Nghe câu mô tả và chọn tranh phù hợp.',
    sortOrder: 1,
  },
  {
    tier: ToeicTier.TOEIC_LR,
    section: ToeicSection.LISTENING,
    part: 2,
    fromNo: 7,
    toNo: 31,
    title: 'Hỏi – đáp',
    titleEn: 'Question-Response',
    description: 'Nghe câu hỏi/câu nói và chọn câu trả lời phù hợp nhất.',
    sortOrder: 2,
  },
  {
    tier: ToeicTier.TOEIC_LR,
    section: ToeicSection.LISTENING,
    part: 3,
    fromNo: 32,
    toNo: 70,
    title: 'Hội thoại',
    titleEn: 'Conversations',
    description: 'Nghe hội thoại và trả lời câu hỏi về nội dung.',
    sortOrder: 3,
  },
  {
    tier: ToeicTier.TOEIC_LR,
    section: ToeicSection.LISTENING,
    part: 4,
    fromNo: 71,
    toNo: 100,
    title: 'Bài nói ngắn',
    titleEn: 'Talks',
    description: 'Nghe bài nói (thông báo, quảng cáo…) và trả lời câu hỏi.',
    sortOrder: 4,
  },
  {
    tier: ToeicTier.TOEIC_LR,
    section: ToeicSection.READING,
    part: 5,
    fromNo: 1,
    toNo: 30,
    title: 'Hoàn thành câu',
    titleEn: 'Incomplete Sentences',
    description: 'Chọn từ/cụm từ phù hợp để hoàn thành câu.',
    sortOrder: 5,
  },
  {
    tier: ToeicTier.TOEIC_LR,
    section: ToeicSection.READING,
    part: 6,
    fromNo: 31,
    toNo: 46,
    title: 'Hoàn thành đoạn văn',
    titleEn: 'Text Completion',
    description: 'Điền từ vào chỗ trống trong email/thư/đoạn văn.',
    sortOrder: 6,
  },
  {
    tier: ToeicTier.TOEIC_LR,
    section: ToeicSection.READING,
    part: 7,
    fromNo: 47,
    toNo: 100,
    title: 'Đọc hiểu',
    titleEn: 'Reading Comprehension',
    description: 'Đọc đoạn văn và trả lời câu hỏi.',
    sortOrder: 7,
  },
];
