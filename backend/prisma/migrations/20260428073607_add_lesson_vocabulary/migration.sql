-- CreateTable
CREATE TABLE "LessonVocabulary" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "frontText" TEXT NOT NULL,
    "backText" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonVocabulary_lessonId_idx" ON "LessonVocabulary"("lessonId");

-- AddForeignKey
ALTER TABLE "LessonVocabulary" ADD CONSTRAINT "LessonVocabulary_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "GrammarLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
