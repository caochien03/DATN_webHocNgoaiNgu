-- AlterTable
ALTER TABLE "Card"
ADD COLUMN "streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "nextReviewAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Card_nextReviewAt_idx" ON "Card"("nextReviewAt");
