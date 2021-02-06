-- CreateEnum
CREATE TYPE "GitCommitStatus" AS ENUM ('UNKNOWN', 'CLEAN', 'DIRTY');

-- AlterTable
ALTER TABLE "CommandRun" ADD COLUMN     "gitCommitStatus" "GitCommitStatus" NOT NULL DEFAULT E'UNKNOWN',
ALTER COLUMN "src" SET DEFAULT E'UNKNOWN',
ALTER COLUMN "status" SET DEFAULT E'UNKNOWN';
