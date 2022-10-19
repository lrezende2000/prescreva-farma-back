import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prismaClient } from "../../database/client";
import { updateUserSchema } from "../../validations/User";

type UpdateUserType = Omit<User, "id" | "password" | "crf" | "crfState">;

export const createUserService = async (userId: number, data: UpdateUserType) => {
  const validatedData = await updateUserSchema.validate(data);

  const user = await prismaClient.user.update({
    where: {
      id: userId
    },
    data: {
      ...validatedData
    },
  });

  return user;
};
