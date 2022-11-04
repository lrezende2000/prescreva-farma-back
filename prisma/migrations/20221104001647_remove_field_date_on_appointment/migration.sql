/*
  Warnings:

  - You are about to drop the column `date` on the `appointments` table. All the data in the column will be lost.
  - Changed the type of `end` on the `appointments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `start` on the `appointments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "date",
DROP COLUMN "end",
ADD COLUMN     "end" DATE NOT NULL,
DROP COLUMN "start",
ADD COLUMN     "start" DATE NOT NULL;
