import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_LANGUAGE_CODE,
  isSupportedLanguageCode,
  SUPPORTED_LANGUAGES,
} from './supported-languages';

export type LearningLanguageRow = {
  languageCode: string;
  nameVi: string;
  isActive: boolean;
  addedAt: Date;
};

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  listSupported() {
    return SUPPORTED_LANGUAGES;
  }

  async ensureDefaultForUser(userId: string): Promise<void> {
    const count = await this.prisma.userLearningLanguage.count({
      where: { userId },
    });
    if (count > 0) return;

    await this.prisma.userLearningLanguage.create({
      data: {
        userId,
        languageCode: DEFAULT_LANGUAGE_CODE,
        isActive: true,
      },
    });
  }

  async listForUser(userId: string): Promise<LearningLanguageRow[]> {
    await this.ensureDefaultForUser(userId);

    const rows = await this.prisma.userLearningLanguage.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { addedAt: 'asc' }],
    });

    return rows.map((row) => ({
      languageCode: row.languageCode,
      nameVi:
        SUPPORTED_LANGUAGES.find((l) => l.code === row.languageCode)?.nameVi ??
        row.languageCode,
      isActive: row.isActive,
      addedAt: row.addedAt,
    }));
  }

  async addForUser(userId: string, languageCode: string) {
    if (!isSupportedLanguageCode(languageCode)) {
      throw new BadRequestException('Ngôn ngữ không được hỗ trợ.');
    }

    await this.ensureDefaultForUser(userId);

    const existing = await this.prisma.userLearningLanguage.findUnique({
      where: { userId_languageCode: { userId, languageCode } },
    });
    if (existing) {
      throw new ConflictException('Bạn đã thêm ngôn ngữ này rồi.');
    }

    const activeCount = await this.prisma.userLearningLanguage.count({
      where: { userId, isActive: true },
    });

    await this.prisma.userLearningLanguage.create({
      data: {
        userId,
        languageCode,
        isActive: activeCount === 0,
      },
    });

    return this.listForUser(userId);
  }

  async setActive(userId: string, languageCode: string) {
    if (!isSupportedLanguageCode(languageCode)) {
      throw new BadRequestException('Ngôn ngữ không được hỗ trợ.');
    }

    await this.ensureDefaultForUser(userId);

    const row = await this.prisma.userLearningLanguage.findUnique({
      where: { userId_languageCode: { userId, languageCode } },
    });
    if (!row) {
      throw new NotFoundException('Bạn chưa thêm ngôn ngữ này.');
    }

    await this.prisma.$transaction([
      this.prisma.userLearningLanguage.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      this.prisma.userLearningLanguage.update({
        where: { id: row.id },
        data: { isActive: true },
      }),
    ]);

    return this.listForUser(userId);
  }
}
