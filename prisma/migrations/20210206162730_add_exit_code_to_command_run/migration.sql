/*
  Warnings:

  - Added the required column `exitCode` to the `CommandRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommandRun" ADD COLUMN     "exitCode" INTEGER NOT NULL;
