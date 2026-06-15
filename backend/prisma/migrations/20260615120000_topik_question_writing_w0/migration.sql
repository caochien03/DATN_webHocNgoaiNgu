-- CreateEnum
CREATE TYPE "TopikQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY');

-- AlterTable
ALTER TABLE "TopikQuestion" ADD COLUMN "questionType" "TopikQuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE';
ALTER TABLE "TopikQuestion" ADD COLUMN "modelAnswer" TEXT;
ALTER TABLE "TopikQuestion" ADD COLUMN "minChars" INTEGER;
ALTER TABLE "TopikQuestion" ADD COLUMN "maxChars" INTEGER;
ALTER TABLE "TopikQuestion" ADD COLUMN "maxScore" INTEGER;
ALTER TABLE "TopikQuestion" ADD COLUMN "rubric" JSONB;

-- CreateIndex
CREATE INDEX "TopikQuestion_questionType_idx" ON "TopikQuestion"("questionType");
