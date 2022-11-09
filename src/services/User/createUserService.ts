import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prismaClient } from "../../database/client";
import { createUserSchema } from "../../validations/User";

type CreateUserType = Omit<User, "id">;

export const createUserService = async (data: CreateUserType) => {
  const validatedData = await createUserSchema.validate(data);

  const foundEmail = await prismaClient.user.findFirst({
    where: {
      email: validatedData.email,
    }
  });

  if (foundEmail) {
    throw new Error('Já existe um usuário com esse email');
  }

  const foundCRF = await prismaClient.user.findFirst({
    where: {
      crf: validatedData.crf,
      crfState: validatedData.crfState,
    }
  });

  if (foundCRF) {
    throw new Error('Já existe um usuário com esse CRF');
  }

  const hashedPassword = await bcrypt.hash(validatedData.password, 11);

  const user = await prismaClient.user.create({
    data: { ...validatedData, password: hashedPassword },
  });

  return user;
};
