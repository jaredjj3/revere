/*
  Warnings:

  - You are about to drop the column `name` on the `TickerThresholdObjective` table. All the data in the column will be lost.
  - You are about to drop the column `startWatchingAt` on the `TickerThresholdObjective` table. All the data in the column will be lost.
  - You are about to drop the column `stopWatchingAt` on the `TickerThresholdObjective` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TickerThresholdObjective" DROP COLUMN "name",
DROP COLUMN "startWatchingAt",
DROP COLUMN "stopWatchingAt";
