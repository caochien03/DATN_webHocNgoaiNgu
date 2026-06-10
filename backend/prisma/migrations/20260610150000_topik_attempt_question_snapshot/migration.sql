-- AlterTable
ALTER TABLE "TopikExamAttempt" ADD COLUMN "questionIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "TopikExamAttempt" ALTER COLUMN "correctCount" SET DEFAULT 0;
ALTER TABLE "TopikExamAttempt" ALTER COLUMN "totalQuestions" SET DEFAULT 0;
ALTER TABLE "TopikExamAttempt" ALTER COLUMN "scorePercent" SET DEFAULT 0;
