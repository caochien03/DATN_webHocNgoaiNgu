-- CreateTable
CREATE TABLE "UserLearningLanguage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLearningLanguage_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "SpeakingTopic" ADD COLUMN "languageCode" TEXT NOT NULL DEFAULT 'ko';

-- AlterTable
ALTER TABLE "SpeakingSituation" ADD COLUMN "languageCode" TEXT NOT NULL DEFAULT 'ko';

-- CreateIndex
CREATE INDEX "UserLearningLanguage_userId_idx" ON "UserLearningLanguage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningLanguage_userId_languageCode_key" ON "UserLearningLanguage"("userId", "languageCode");

-- CreateIndex
CREATE INDEX "SpeakingTopic_languageCode_isPublished_sortOrder_idx" ON "SpeakingTopic"("languageCode", "isPublished", "sortOrder");

-- DropIndex
DROP INDEX IF EXISTS "SpeakingTopic_isPublished_sortOrder_idx";

-- CreateIndex
CREATE INDEX "SpeakingSituation_languageCode_level_isPublished_idx" ON "SpeakingSituation"("languageCode", "level", "isPublished");

-- DropIndex
DROP INDEX IF EXISTS "SpeakingSituation_level_isPublished_idx";

-- AddForeignKey
ALTER TABLE "UserLearningLanguage" ADD CONSTRAINT "UserLearningLanguage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
