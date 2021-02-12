/*
  Warnings:

  - You are about to drop the column `cmp` on the `TickerThresholdObjective` table. All the data in the column will be lost.
  - You are about to drop the column `threshold` on the `TickerThresholdObjective` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TickerThresholdObjective" DROP COLUMN "cmp",
DROP COLUMN "threshold",
ADD COLUMN     "lowerBound" DECIMAL(65,30),
ADD COLUMN     "upperBound" DECIMAL(65,30),
ADD COLUMN     "jobId" INTEGER;

-- DropEnum
DROP TYPE "Cmp";

-- AddForeignKey
ALTER TABLE "TickerThresholdObjective" ADD FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
