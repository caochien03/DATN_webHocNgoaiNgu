-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "sourceTopicId" TEXT;

-- CreateTable
CREATE TABLE "VocabularyTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "languageCode" TEXT NOT NULL DEFAULT 'ko',
    "level" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyWord" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "frontText" TEXT NOT NULL,
    "backText" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VocabularyTopic_languageCode_idx" ON "VocabularyTopic"("languageCode");

-- CreateIndex
CREATE INDEX "VocabularyTopic_level_idx" ON "VocabularyTopic"("level");

-- CreateIndex
CREATE INDEX "VocabularyWord_topicId_idx" ON "VocabularyWord"("topicId");

-- CreateIndex
CREATE INDEX "Deck_sourceTopicId_idx" ON "Deck"("sourceTopicId");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_sourceTopicId_fkey" FOREIGN KEY ("sourceTopicId") REFERENCES "VocabularyTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyWord" ADD CONSTRAINT "VocabularyWord_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "VocabularyTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
