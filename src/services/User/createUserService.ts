import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";

import { prismaClient } from "../../database/client";
import { generateRandomPassword } from "../../helpers/password";
import { welcomeTemplate } from "../../templates/welcome";
import { createUserSchema } from "../../validations/User";

type CreateUserType = Omit<User, "id">;

export const createUserService = async (data: CreateUserType, url?: string) => {
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

  const password = generateRandomPassword();

  const hashedPassword = await bcrypt.hash(password, 11);

  const user = await prismaClient.user.create({
    data: { ...validatedData, password: hashedPassword },
  });

  if (url) {
    await sgMail.send({
      to: user.email,
      from: "lrezendev.pj@gmail.com",
      html: welcomeTemplate(user.name, url, user.email, password),
      subject: "Seja bem vindo ao PrescrevaFarma!",
    });
  }

  return user;
};
