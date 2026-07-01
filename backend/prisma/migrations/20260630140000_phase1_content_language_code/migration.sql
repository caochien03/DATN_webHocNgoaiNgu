-- AlterTable
ALTER TABLE "GrammarLesson" ADD COLUMN "languageCode" TEXT NOT NULL DEFAULT 'ko';

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN "languageCode" TEXT NOT NULL DEFAULT 'ko';

-- AlterTable
ALTER TABLE "SpeakingSession" ADD COLUMN "languageCode" TEXT NOT NULL DEFAULT 'ko';

-- Rename columns (SpeakingTopic, SpeakingSituation)
ALTER TABLE "SpeakingTopic" RENAME COLUMN "titleKo" TO "titleNative";
ALTER TABLE "SpeakingSituation" RENAME COLUMN "openingLineKo" TO "openingLine";

-- Backfill session language from situation
UPDATE "SpeakingSession" ss
SET "languageCode" = s."languageCode"
FROM "SpeakingSituation" s
WHERE ss."situationId" = s."id";

-- CreateIndex
CREATE INDEX "GrammarLesson_languageCode_level_idx" ON "GrammarLesson"("languageCode", "level");

-- DropIndex
DROP INDEX IF EXISTS "GrammarLesson_level_idx";

-- CreateIndex
CREATE INDEX "Deck_userId_languageCode_idx" ON "Deck"("userId", "languageCode");

-- CreateIndex
CREATE INDEX "SpeakingSession_userId_languageCode_idx" ON "SpeakingSession"("userId", "languageCode");
