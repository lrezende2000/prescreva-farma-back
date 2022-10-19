import { Prescription } from "@prisma/client";

import { prismaClient } from "../../database/client";
// import { createPacientSchema } from "../../validations/Pacient";

type CreatePrescriptionType = Omit<Prescription, "id">;

export const createPacientService = async (data: CreatePrescriptionType) => {
  // const validatedData = await createPacientSchema.validate(data);

  const pacient = await prismaClient.prescription.create({
    data: data,
  });

  return pacient;
};
