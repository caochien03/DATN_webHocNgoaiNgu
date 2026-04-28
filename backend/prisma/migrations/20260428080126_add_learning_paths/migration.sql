-- CreateEnum
CREATE TYPE "LearningPathStepType" AS ENUM ('TOPIC', 'LESSON');

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "languageCode" TEXT NOT NULL DEFAULT 'ko',
    "level" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathStep" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "type" "LearningPathStepType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "topicId" TEXT,
    "lessonId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPathProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "completedStepIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPathProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningPath_languageCode_idx" ON "LearningPath"("languageCode");

-- CreateIndex
CREATE INDEX "LearningPath_level_idx" ON "LearningPath"("level");

-- CreateIndex
CREATE INDEX "LearningPathStep_pathId_idx" ON "LearningPathStep"("pathId");

-- CreateIndex
CREATE INDEX "LearningPathStep_topicId_idx" ON "LearningPathStep"("topicId");

-- CreateIndex
CREATE INDEX "LearningPathStep_lessonId_idx" ON "LearningPathStep"("lessonId");

-- CreateIndex
CREATE INDEX "UserPathProgress_userId_idx" ON "UserPathProgress"("userId");

-- CreateIndex
CREATE INDEX "UserPathProgress_pathId_idx" ON "UserPathProgress"("pathId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPathProgress_userId_pathId_key" ON "UserPathProgress"("userId", "pathId");

-- AddForeignKey
ALTER TABLE "LearningPathStep" ADD CONSTRAINT "LearningPathStep_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathStep" ADD CONSTRAINT "LearningPathStep_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "VocabularyTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathStep" ADD CONSTRAINT "LearningPathStep_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "GrammarLesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPathProgress" ADD CONSTRAINT "UserPathProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPathProgress" ADD CONSTRAINT "UserPathProgress_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
