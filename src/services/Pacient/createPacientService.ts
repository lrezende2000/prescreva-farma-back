import { prismaClient } from "../../database/client";
// import { createUserSchema } from "../../validations/User";
import { Pacient } from "@prisma/client";

type CreatePacientType = Omit<Pacient, "id">;

export const createUserService = async (data: CreatePacientType) => {
  // const validatedData = await createUserSchema.validate(data);

  // const user = await prismaClient.user.create({
  //   data: validatedData,
  // });

  // return user;
};
