-- AlterTable
ALTER TABLE "TopikQuestion" ADD COLUMN "bundleId" TEXT;

-- CreateIndex
CREATE INDEX "TopikQuestion_bundleId_idx" ON "TopikQuestion"("bundleId");
