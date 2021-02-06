/*
  Warnings:

  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CommandRunStatus" AS ENUM ('UNKNOWN', 'ERROR', 'SUCCESS');

-- CreateEnum
CREATE TYPE "CommandRunSrc" AS ENUM ('CONSOLE', 'DISCORD', 'JOB');

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "command" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandRun" (
    "id" SERIAL NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "src" "CommandRunSrc" NOT NULL,
    "status" "CommandRunStatus" NOT NULL,
    "command" TEXT NOT NULL,
    "gitCommitHash" TEXT NOT NULL,
    "stdout" TEXT NOT NULL,
    "stderr" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE "Schedule";

-- CreateIndex
CREATE UNIQUE INDEX "Job.name_unique" ON "Job"("name");
