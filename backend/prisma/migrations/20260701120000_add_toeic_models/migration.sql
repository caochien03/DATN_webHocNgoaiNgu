-- CreateEnum
CREATE TYPE "ToeicTier" AS ENUM ('TOEIC_LR');

-- CreateEnum
CREATE TYPE "ToeicSection" AS ENUM ('LISTENING', 'READING');

-- CreateEnum
CREATE TYPE "ToeicAttemptMode" AS ENUM ('FULL_EXAM', 'PRACTICE');

-- CreateTable
CREATE TABLE "ToeicQuestionFormat" (
    "id" TEXT NOT NULL,
    "tier" "ToeicTier" NOT NULL DEFAULT 'TOEIC_LR',
    "section" "ToeicSection" NOT NULL,
    "part" INTEGER NOT NULL,
    "fromNo" INTEGER NOT NULL,
    "toNo" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToeicQuestionFormat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToeicQuestion" (
    "id" TEXT NOT NULL,
    "tier" "ToeicTier" NOT NULL DEFAULT 'TOEIC_LR',
    "section" "ToeicSection" NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "passage" TEXT,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "optionImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bundleId" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToeicQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToeicExam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tier" "ToeicTier" NOT NULL DEFAULT 'TOEIC_LR',
    "durationMinutes" INTEGER NOT NULL DEFAULT 120,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToeicExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToeicExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ToeicExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToeicExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "ToeicAttemptMode" NOT NULL,
    "examId" TEXT,
    "tier" "ToeicTier" NOT NULL DEFAULT 'TOEIC_LR',
    "section" "ToeicSection",
    "formatFromNo" INTEGER,
    "formatToNo" INTEGER,
    "questionIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "answers" JSONB NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "scorePercent" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ToeicExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToeicQuestionFormat_tier_section_fromNo_toNo_key" ON "ToeicQuestionFormat"("tier", "section", "fromNo", "toNo");

-- CreateIndex
CREATE INDEX "ToeicQuestionFormat_tier_section_sortOrder_idx" ON "ToeicQuestionFormat"("tier", "section", "sortOrder");

-- CreateIndex
CREATE INDEX "ToeicQuestion_tier_section_questionNo_idx" ON "ToeicQuestion"("tier", "section", "questionNo");

-- CreateIndex
CREATE INDEX "ToeicQuestion_isPublished_idx" ON "ToeicQuestion"("isPublished");

-- CreateIndex
CREATE INDEX "ToeicQuestion_bundleId_idx" ON "ToeicQuestion"("bundleId");

-- CreateIndex
CREATE INDEX "ToeicExam_tier_isPublished_idx" ON "ToeicExam"("tier", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "ToeicExamQuestion_examId_questionId_key" ON "ToeicExamQuestion"("examId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ToeicExamQuestion_examId_sortOrder_key" ON "ToeicExamQuestion"("examId", "sortOrder");

-- CreateIndex
CREATE INDEX "ToeicExamQuestion_examId_idx" ON "ToeicExamQuestion"("examId");

-- CreateIndex
CREATE INDEX "ToeicExamAttempt_userId_finishedAt_idx" ON "ToeicExamAttempt"("userId", "finishedAt");

-- CreateIndex
CREATE INDEX "ToeicExamAttempt_examId_idx" ON "ToeicExamAttempt"("examId");

-- AddForeignKey
ALTER TABLE "ToeicExamQuestion" ADD CONSTRAINT "ToeicExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "ToeicExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToeicExamQuestion" ADD CONSTRAINT "ToeicExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ToeicQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToeicExamAttempt" ADD CONSTRAINT "ToeicExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToeicExamAttempt" ADD CONSTRAINT "ToeicExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "ToeicExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
