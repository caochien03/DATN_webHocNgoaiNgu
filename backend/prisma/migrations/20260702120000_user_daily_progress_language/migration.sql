-- AlterTable
ALTER TABLE "UserDailyProgress" ADD COLUMN "languageCode" TEXT NOT NULL DEFAULT 'ko';

-- DropIndex
DROP INDEX "UserDailyProgress_userId_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyProgress_userId_date_languageCode_key" ON "UserDailyProgress"("userId", "date", "languageCode");

-- CreateIndex
CREATE INDEX "UserDailyProgress_userId_languageCode_date_idx" ON "UserDailyProgress"("userId", "languageCode", "date");
