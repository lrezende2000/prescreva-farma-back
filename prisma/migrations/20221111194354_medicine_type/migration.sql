-- CreateEnum
CREATE TYPE "MedicineType" AS ENUM ('MEDICINE', 'HERBAL_MEDICINES');

-- AlterTable
ALTER TABLE "medicines" ADD COLUMN     "type" "MedicineType" NOT NULL DEFAULT 'MEDICINE',
ALTER COLUMN "maximum_dosage" DROP NOT NULL;
