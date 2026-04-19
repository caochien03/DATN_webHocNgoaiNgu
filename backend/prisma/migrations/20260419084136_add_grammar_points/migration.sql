-- CreateEnum
CREATE TYPE "GrammarLevel" AS ENUM ('BEGINNER_1', 'BEGINNER_2', 'INTERMEDIATE_1', 'INTERMEDIATE_2', 'ADVANCED_1', 'ADVANCED_2');

-- CreateTable
CREATE TABLE "GrammarPoint" (
    "id" TEXT NOT NULL,
    "level" "GrammarLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "meaning" TEXT,
    "structure" TEXT,
    "example" TEXT,
    "translation" TEXT,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrammarPoint_level_idx" ON "GrammarPoint"("level");
