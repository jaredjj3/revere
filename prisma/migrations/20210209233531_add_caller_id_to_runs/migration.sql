-- CreateEnum
CREATE TYPE "CallerType" AS ENUM ('UNKNOWN', 'HUMAN', 'COMPUTER');

-- AlterTable
ALTER TABLE "CommandRun" ADD COLUMN     "callerId" TEXT,
ADD COLUMN     "callerType" "CallerType" NOT NULL DEFAULT E'UNKNOWN';
