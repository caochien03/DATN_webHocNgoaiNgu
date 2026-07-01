-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN "languageCode" TEXT NOT NULL DEFAULT 'ko';

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_languageCode_createdAt_idx" ON "QuizAttempt"("userId", "languageCode", "createdAt");
