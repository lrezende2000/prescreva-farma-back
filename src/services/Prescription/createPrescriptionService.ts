import { Prescription } from "@prisma/client";

import { prismaClient } from "../../database/client";
import { createPrescriptionSchema } from "../../validations/Prescription";

type CreatePrescriptionType = Omit<Prescription, "id">;

export const createPrescriptionService = async (data: CreatePrescriptionType) => {
  const { prescriptionMedicines, ...validatedData } = await createPrescriptionSchema.validate(data);

  const prescription = await prismaClient.prescription.create({
    data: {
      ...validatedData,
      prescriptionMedicines: {
        createMany: {
          data: prescriptionMedicines,
          skipDuplicates: true,
        }
      }
    },
  });

  return prescription;
};
