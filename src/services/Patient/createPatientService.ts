import { Patient } from "@prisma/client";

import { prismaClient } from "../../database/client";
import { createPatientSchema } from "../../validations/Patient";

type CreatePatientType = Omit<Patient, "id">;

export const createPacientService = async (data: CreatePatientType) => {
  const validatedData = await createPatientSchema.validate(data);

  const pacient = await prismaClient.patient.create({
    data: validatedData,
  });

  return pacient;
};
