-- CreateEnum
CREATE TYPE "Types" AS ENUM ('YOUTUBE', 'DRIVE', 'TELEGRAM', 'OTHER');

-- CreateEnum
CREATE TYPE "Subjects" AS ENUM ('CALC_1', 'CALC_2', 'PHYSICS_1', 'PHYSICS_2', 'INTRO_TO_CS');

-- CreateTable
CREATE TABLE "data" (
    "id" SERIAL NOT NULL,
    "subject" "Subjects" NOT NULL,
    "link" TEXT NOT NULL,
    "type" "Types" NOT NULL,

    CONSTRAINT "data_pkey" PRIMARY KEY ("id")
);
