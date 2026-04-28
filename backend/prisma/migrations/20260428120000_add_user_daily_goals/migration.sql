-- CreateTable
CREATE TABLE "UserGoalSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyCardTarget" INTEGER NOT NULL DEFAULT 20,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoalSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDailyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reviewedCards" INTEGER NOT NULL DEFAULT 0,
    "quizAttempts" INTEGER NOT NULL DEFAULT 0,
    "goalTarget" INTEGER NOT NULL DEFAULT 20,
    "goalAchieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDailyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoalSetting_userId_key" ON "UserGoalSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyProgress_userId_date_key" ON "UserDailyProgress"("userId", "date");

-- CreateIndex
CREATE INDEX "UserDailyProgress_userId_date_idx" ON "UserDailyProgress"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserGoalSetting" ADD CONSTRAINT "UserGoalSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyProgress" ADD CONSTRAINT "UserDailyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
