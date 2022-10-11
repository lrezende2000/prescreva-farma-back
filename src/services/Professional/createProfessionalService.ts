import { prismaClient } from "../../database/client";
import { createProfessionalSchema } from "../../validations/Professional";
import { Professional } from "@prisma/client";

type CreateProfessionalType = Omit<Professional, "id">;

export const createProfessionalService = async (data: CreateProfessionalType) => {
  const validatedData = await createProfessionalSchema.validate(data);

  const professional = await prismaClient.professional.create({
    data: validatedData,
  });

  return professional;
};
