-- CreateEnum
CREATE TYPE "Cmp" AS ENUM ('LT', 'LTEQ', 'EQ', 'GTEQ', 'GT');

-- CreateTable
CREATE TABLE "TickerThresholdObjective" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "cmp" "Cmp" NOT NULL,
    "threshold" DECIMAL(65,30) NOT NULL,
    "message" TEXT,
    "numNotifications" INTEGER NOT NULL,
    "startWatchingAt" TIMESTAMP(3),
    "stopWatchingAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TickerThresholdData" (
    "id" SERIAL NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "tickerThresholdObjectiveId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TickerThresholdData" ADD FOREIGN KEY ("tickerThresholdObjectiveId") REFERENCES "TickerThresholdObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;
