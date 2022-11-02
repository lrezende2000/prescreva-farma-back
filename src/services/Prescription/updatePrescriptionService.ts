import { Prescription } from "@prisma/client";

import { prismaClient } from "../../database/client";
// import { createPacientSchema } from "../../validations/Pacient";

type UpdatePrescriptionType = Omit<Prescription, 'id'>;

export const updatePacientService = async (data: UpdatePrescriptionType, prescriptionId: number) => {
  // const validatedData = await createPacientSchema.validate(data);

  const update = { ...data };

  const prescription = await prismaClient.prescription.update({
    where: {
      id: prescriptionId,
    },
    data: update,
  });

  return prescription;
};
