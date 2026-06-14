-- AlterTable
ALTER TABLE "TopikQuestion" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "TopikQuestion" ADD COLUMN "optionImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
