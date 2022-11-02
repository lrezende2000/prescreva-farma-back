/*
  Warnings:

  - A unique constraint covering the columns `[professional_id,email]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `administrationForm` to the `prescription_medicines` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "patients_email_key";

-- AlterTable
ALTER TABLE "prescription_medicines" ADD COLUMN     "administrationForm" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Avaliation" (
    "id" SERIAL NOT NULL,
    "grade" INTEGER NOT NULL,
    "professional_id" INTEGER NOT NULL,

    CONSTRAINT "Avaliation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_professional_id_email_key" ON "patients"("professional_id", "email");

-- AddForeignKey
ALTER TABLE "Avaliation" ADD CONSTRAINT "Avaliation_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
