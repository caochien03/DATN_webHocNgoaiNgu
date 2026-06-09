-- CreateEnum
CREATE TYPE "TopikTier" AS ENUM ('TOPIK_I', 'TOPIK_II');

-- CreateEnum
CREATE TYPE "TopikSection" AS ENUM ('LISTENING', 'READING', 'WRITING');

-- CreateEnum
CREATE TYPE "TopikAttemptMode" AS ENUM ('FULL_EXAM', 'PRACTICE');

-- CreateTable
CREATE TABLE "TopikQuestionFormat" (
    "id" TEXT NOT NULL,
    "tier" "TopikTier" NOT NULL,
    "section" "TopikSection" NOT NULL,
    "fromNo" INTEGER NOT NULL,
    "toNo" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleKo" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopikQuestionFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopikQuestion" (
    "id" TEXT NOT NULL,
    "tier" "TopikTier" NOT NULL,
    "section" "TopikSection" NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "passage" TEXT,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "audioUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 2,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopikQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopikExam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tier" "TopikTier" NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 100,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopikExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopikExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "TopikExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopikExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "TopikAttemptMode" NOT NULL,
    "examId" TEXT,
    "tier" "TopikTier" NOT NULL,
    "section" "TopikSection",
    "formatFromNo" INTEGER,
    "formatToNo" INTEGER,
    "answers" JSONB NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "TopikExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopikQuestionFormat_tier_section_sortOrder_idx" ON "TopikQuestionFormat"("tier", "section", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TopikQuestionFormat_tier_section_fromNo_toNo_key" ON "TopikQuestionFormat"("tier", "section", "fromNo", "toNo");

-- CreateIndex
CREATE INDEX "TopikQuestion_tier_section_questionNo_idx" ON "TopikQuestion"("tier", "section", "questionNo");

-- CreateIndex
CREATE INDEX "TopikQuestion_isPublished_idx" ON "TopikQuestion"("isPublished");

-- CreateIndex
CREATE INDEX "TopikExam_tier_isPublished_idx" ON "TopikExam"("tier", "isPublished");

-- CreateIndex
CREATE INDEX "TopikExamQuestion_examId_idx" ON "TopikExamQuestion"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "TopikExamQuestion_examId_questionId_key" ON "TopikExamQuestion"("examId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TopikExamQuestion_examId_sortOrder_key" ON "TopikExamQuestion"("examId", "sortOrder");

-- CreateIndex
CREATE INDEX "TopikExamAttempt_userId_finishedAt_idx" ON "TopikExamAttempt"("userId", "finishedAt");

-- CreateIndex
CREATE INDEX "TopikExamAttempt_examId_idx" ON "TopikExamAttempt"("examId");

-- AddForeignKey
ALTER TABLE "TopikExamQuestion" ADD CONSTRAINT "TopikExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "TopikExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopikExamQuestion" ADD CONSTRAINT "TopikExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TopikQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopikExamAttempt" ADD CONSTRAINT "TopikExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopikExamAttempt" ADD CONSTRAINT "TopikExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "TopikExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
