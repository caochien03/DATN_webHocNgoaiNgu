/*
  Warnings:

  - You are about to drop the column `level` on the `GrammarPoint` table. All the data in the column will be lost.
  - Added the required column `lessonId` to the `GrammarPoint` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GrammarPoint_level_idx";

-- AlterTable
ALTER TABLE "GrammarPoint" DROP COLUMN "level",
ADD COLUMN     "lessonId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "GrammarLesson" (
    "id" TEXT NOT NULL,
    "level" "GrammarLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrammarLesson_level_idx" ON "GrammarLesson"("level");

-- CreateIndex
CREATE INDEX "GrammarPoint_lessonId_idx" ON "GrammarPoint"("lessonId");

-- AddForeignKey
ALTER TABLE "GrammarPoint" ADD CONSTRAINT "GrammarPoint_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "GrammarLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
