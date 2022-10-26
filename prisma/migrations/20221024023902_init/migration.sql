-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('WOMAN', 'MEN', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('FINISHED', 'CANCELED', 'PENDING', 'CONFIRMED', 'DID_NOT_ATTEND');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "crf" VARCHAR(4) NOT NULL,
    "crfState" VARCHAR(2) NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "street" VARCHAR(100) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "complement" VARCHAR(150),
    "number" VARCHAR(10) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "tel" VARCHAR(10),
    "phone" VARCHAR(11) NOT NULL,
    "password" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "nacionality" VARCHAR(50) NOT NULL,
    "token" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacients" (
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

    CONSTRAINT "pacients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicines" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sub_group" VARCHAR(200) NOT NULL,
    "pharmaceutical_form" VARCHAR(100) NOT NULL,
    "maximum_dosage" VARCHAR(20) NOT NULL,
    "therapeutic_indication" VARCHAR(255) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "pacient_id" INTEGER NOT NULL,
    "aditional_infos" TEXT,
    "non_pharmacological_therapy" TEXT,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_medicines" (
    "id" SERIAL NOT NULL,
    "prescription_id" INTEGER NOT NULL,
    "medicine_id" INTEGER NOT NULL,
    "concentration" VARCHAR(20) NOT NULL,
    "instructions" VARCHAR(255) NOT NULL,

    CONSTRAINT "prescription_medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forwarders" (
    "id" SERIAL NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "pacient_id" INTEGER NOT NULL,
    "medicalExperience" VARCHAR(50) NOT NULL,
    "forwardReason" TEXT NOT NULL,

    CONSTRAINT "forwarders_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacients_email_key" ON "pacients"("email");

-- AddForeignKey
ALTER TABLE "pacients" ADD CONSTRAINT "pacients_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_pacient_id_fkey" FOREIGN KEY ("pacient_id") REFERENCES "pacients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_medicines" ADD CONSTRAINT "prescription_medicines_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_medicines" ADD CONSTRAINT "prescription_medicines_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forwarders" ADD CONSTRAINT "forwarders_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forwarders" ADD CONSTRAINT "forwarders_pacient_id_fkey" FOREIGN KEY ("pacient_id") REFERENCES "pacients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pacient_id_fkey" FOREIGN KEY ("pacient_id") REFERENCES "pacients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
