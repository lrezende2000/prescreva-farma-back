/*
  Warnings:

  - You are about to drop the column `pacient_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `pacient_id` on the `forwarders` table. All the data in the column will be lost.
  - You are about to drop the column `pacient_id` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the `pacients` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `end` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_id` to the `forwarders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_id` to the `prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_pacient_id_fkey";

-- DropForeignKey
ALTER TABLE "forwarders" DROP CONSTRAINT "forwarders_pacient_id_fkey";

-- DropForeignKey
ALTER TABLE "pacients" DROP CONSTRAINT "pacients_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_pacient_id_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "pacient_id",
DROP COLUMN "time",
ADD COLUMN     "end" TIME NOT NULL,
ADD COLUMN     "patient_id" INTEGER NOT NULL,
ADD COLUMN     "start" TIME NOT NULL;

-- AlterTable
ALTER TABLE "forwarders" DROP COLUMN "pacient_id",
ADD COLUMN     "patient_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "pacient_id",
ADD COLUMN     "patient_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "pacients";

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "tel" VARCHAR(10),
    "nacionality" VARCHAR(50) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "phone" VARCHAR(11) NOT NULL,
    "professional_id" INTEGER NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forwarders" ADD CONSTRAINT "forwarders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
