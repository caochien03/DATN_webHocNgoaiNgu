-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "correctCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastResult" BOOLEAN,
ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "wrongCount" INTEGER NOT NULL DEFAULT 0;
