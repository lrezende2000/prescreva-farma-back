import { Prescription } from "@prisma/client";

import { prismaClient } from "../../database/client";
// import { createPacientSchema } from "../../validations/Pacient";

type CreatePrescriptionType = Prescription;

export const createPacientService = async (data: CreatePrescriptionType) => {
  // const validatedData = await createPacientSchema.validate(data);

  const prescriptionId = data.id;
  const update = { ...data };

  delete update.id;

  const prescription = await prismaClient.prescription.update({
    where: {
      id: prescriptionId,
    },
    data: update,
  });

  return prescription;
};
