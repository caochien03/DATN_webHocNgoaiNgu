-- CreateTable
CREATE TABLE "GrammarExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrammarExercise_lessonId_idx" ON "GrammarExercise"("lessonId");

-- AddForeignKey
ALTER TABLE "GrammarExercise" ADD CONSTRAINT "GrammarExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "GrammarLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
