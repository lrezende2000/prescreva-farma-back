import { Patient } from "@prisma/client";

import { prismaClient } from "../../database/client";
import { createPatientSchema } from "../../validations/Patient";

type CreatePatientType = Omit<Patient, "id">;

export const createPacientService = async (data: CreatePatientType) => {
  const validatedData = await createPatientSchema.validate(data);

  const emailAlreadyExists = await prismaClient.patient.findFirst({
    where: {
      professionalId: data.professionalId,
      email: data.email
    }
  });

  const cpfAlreadyExists = await prismaClient.patient.findFirst({
    where: {
      professionalId: data.professionalId,
      cpf: data.cpf,
    }
  })

  if (emailAlreadyExists && emailAlreadyExists.email) {
    throw new Error("Já existe um paciente com esse email");
  }

  if (cpfAlreadyExists) {
    throw new Error("Já existe um paciente com esse CPF");
  }

  const pacient = await prismaClient.patient.create({
    data: validatedData,
  });

  return pacient;
};
