-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('WOMAN', 'MEN', 'OTHER');

-- CreateEnum
CREATE TYPE "Weekdays" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "PacientMedicineFrequency" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'EVERYDAY');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('FINISHED', 'CANCELED', 'PENDING', 'CONFIRMED', 'DID_NOT_ATTEND');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nick" VARCHAR(20),
    "cpf" VARCHAR(11) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "nacionality" VARCHAR(50) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacients" (
    "id" SERIAL NOT NULL,
    "cep" VARCHAR(8),
    "street" VARCHAR(100),
    "district" VARCHAR(50),
    "complement" VARCHAR(150),
    "number" VARCHAR(10),
    "tel" VARCHAR(10),
    "phone" VARCHAR(11) NOT NULL,
    "birth_state" VARCHAR(2) NOT NULL,
    "occupation" VARCHAR(50) NOT NULL,
    "scholarity" VARCHAR(50) NOT NULL,
    "caregiver" VARCHAR(100),
    "user_id" INTEGER NOT NULL,
    "professional_id" INTEGER NOT NULL,

    CONSTRAINT "pacients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionals" (
    "id" SERIAL NOT NULL,
    "professional_email" TEXT,
    "crf" VARCHAR(20) NOT NULL,
    "cep" VARCHAR(8),
    "street" VARCHAR(100),
    "district" VARCHAR(50),
    "complement" VARCHAR(150),
    "number" VARCHAR(10),
    "tel" VARCHAR(10),
    "phone" VARCHAR(11) NOT NULL,
    "consult_duration" TIME,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedule" (
    "id" SERIAL NOT NULL,
    "weekday" "Weekdays" NOT NULL,
    "from" TIME NOT NULL,
    "to" TIME NOT NULL,
    "professional_id" INTEGER NOT NULL,

    CONSTRAINT "work_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicines" (
    "id" SERIAL NOT NULL,
    "comercial_name" VARCHAR(50) NOT NULL,
    "active_principle" VARCHAR(50) NOT NULL,
    "dosage" VARCHAR(20) NOT NULL,
    "therapeutic_class" VARCHAR(30) NOT NULL,
    "category" VARCHAR(30) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacient_medicines" (
    "id" SERIAL NOT NULL,
    "medicine_id" INTEGER NOT NULL,
    "pacient_id" INTEGER NOT NULL,
    "professional_id" INTEGER NOT NULL,

    CONSTRAINT "pacient_medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacient_medicine_schedule" (
    "id" SERIAL NOT NULL,
    "pacient_medicine_id" INTEGER NOT NULL,
    "time" TIME NOT NULL,
    "frequency" "PacientMedicineFrequency" NOT NULL,
    "end_date" TIMESTAMP NOT NULL,

    CONSTRAINT "pacient_medicine_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacient_medicine_history" (
    "id" SERIAL NOT NULL,
    "pacient_medicine_schedule_id" INTEGER NOT NULL,
    "took" BOOLEAN NOT NULL DEFAULT false,
    "date" DATE NOT NULL,

    CONSTRAINT "pacient_medicine_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "professional_id" INTEGER NOT NULL,
    "pacient_id" INTEGER NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacients_user_id_key" ON "pacients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pacients_user_id_professional_id_key" ON "pacients"("user_id", "professional_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_crf_key" ON "professionals"("crf");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_user_id_key" ON "professionals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_schedule_weekday_from_to_professional_id_key" ON "work_schedule"("weekday", "from", "to", "professional_id");

-- CreateIndex
CREATE UNIQUE INDEX "medicines_comercial_name_key" ON "medicines"("comercial_name");

-- CreateIndex
CREATE UNIQUE INDEX "pacient_medicine_schedule_pacient_medicine_id_time_key" ON "pacient_medicine_schedule"("pacient_medicine_id", "time");

-- AddForeignKey
ALTER TABLE "pacients" ADD CONSTRAINT "pacients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacients" ADD CONSTRAINT "pacients_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedule" ADD CONSTRAINT "work_schedule_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacient_medicines" ADD CONSTRAINT "pacient_medicines_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacient_medicines" ADD CONSTRAINT "pacient_medicines_pacient_id_fkey" FOREIGN KEY ("pacient_id") REFERENCES "pacients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacient_medicines" ADD CONSTRAINT "pacient_medicines_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacient_medicine_schedule" ADD CONSTRAINT "pacient_medicine_schedule_pacient_medicine_id_fkey" FOREIGN KEY ("pacient_medicine_id") REFERENCES "pacient_medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pacient_id_fkey" FOREIGN KEY ("pacient_id") REFERENCES "pacients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
