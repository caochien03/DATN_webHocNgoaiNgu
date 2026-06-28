-- CreateEnum
CREATE TYPE "SpeakingSelfLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SpeakingSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "SpeakingTurnSpeaker" AS ENUM ('USER', 'NPC');

-- CreateTable
CREATE TABLE "SpeakingTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleKo" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSituation" (
    "id" TEXT NOT NULL,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "contextVi" TEXT NOT NULL,
    "level" "SpeakingSelfLevel" NOT NULL,
    "userRoleVi" TEXT NOT NULL,
    "npcRoleVi" TEXT NOT NULL,
    "openingLineKo" TEXT NOT NULL,
    "goals" JSONB NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "maxUserTurns" INTEGER NOT NULL DEFAULT 5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingSituation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "situationId" TEXT NOT NULL,
    "status" "SpeakingSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "selectedTopicIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "selfLevel" "SpeakingSelfLevel" NOT NULL,
    "filledGoals" JSONB NOT NULL DEFAULT '{}',
    "overallScore" DOUBLE PRECISION,
    "estimatedLevel" TEXT,
    "summaryFeedback" TEXT,
    "goalsCompleted" INTEGER,
    "goalsTotal" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingTurn" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "speaker" "SpeakingTurnSpeaker" NOT NULL,
    "text" TEXT NOT NULL,
    "grading" JSONB,
    "durationSecs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingTurn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpeakingTopic_isPublished_sortOrder_idx" ON "SpeakingTopic"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "SpeakingSituation_topicId_idx" ON "SpeakingSituation"("topicId");

-- CreateIndex
CREATE INDEX "SpeakingSituation_level_isPublished_idx" ON "SpeakingSituation"("level", "isPublished");

-- CreateIndex
CREATE INDEX "SpeakingSituation_isPublished_sortOrder_idx" ON "SpeakingSituation"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "SpeakingSession_userId_createdAt_idx" ON "SpeakingSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SpeakingSession_situationId_idx" ON "SpeakingSession"("situationId");

-- CreateIndex
CREATE INDEX "SpeakingSession_status_idx" ON "SpeakingSession"("status");

-- CreateIndex
CREATE INDEX "SpeakingTurn_sessionId_idx" ON "SpeakingTurn"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakingTurn_sessionId_orderIndex_key" ON "SpeakingTurn"("sessionId", "orderIndex");

-- AddForeignKey
ALTER TABLE "SpeakingSituation" ADD CONSTRAINT "SpeakingSituation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SpeakingTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSession" ADD CONSTRAINT "SpeakingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSession" ADD CONSTRAINT "SpeakingSession_situationId_fkey" FOREIGN KEY ("situationId") REFERENCES "SpeakingSituation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingTurn" ADD CONSTRAINT "SpeakingTurn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SpeakingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
