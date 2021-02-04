-- CreateTable
CREATE TABLE "SquozeResponse" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "httpStatusCode" INTEGER NOT NULL,
    "header" TEXT,

    PRIMARY KEY ("id")
);
