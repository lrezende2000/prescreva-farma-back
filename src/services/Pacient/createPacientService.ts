import { Pacient } from "@prisma/client";

import { prismaClient } from "../../database/client";
import { createPacientSchema } from "../../validations/Pacient";

type CreatePacientType = Omit<Pacient, "id">;

export const createPacientService = async (data: CreatePacientType) => {
  const validatedData = await createPacientSchema.validate(data);

  const pacient = await prismaClient.pacient.create({
    data: validatedData,
  });

  return pacient;
};
