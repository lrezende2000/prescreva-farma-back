import bcrypt from "bcryptjs";

import { prismaClient } from "../database/client";

(async () => {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.log("Defina as variáveis de ambiente ADMIN_EMAIL e ADMIN_PASSWORD para criar o usuário administrador");
    return;
  }

  const foundAdminUser = await prismaClient.user.findFirst({ where: { isAdmin: true } });

  if (foundAdminUser) {
    console.log("Usuário admin já existe");
    console.log(`Email: ${foundAdminUser.email}`);
    return;
  }


  const foundEmail = await prismaClient.user.findFirst({ where: { email } });

  if (foundEmail) {
    console.log("Já existe um usuário com esse email, delete-o ou altere o email do administrador");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 11);

  await prismaClient.user.create({
    data: {
      isAdmin: true,
      birthDate: new Date(),
      cep: '00000000',
      city: 'city',
      state: 'UF',
      cpf: '00000000000',
      crf: '0000',
      crfState: 'UF',
      district: 'district',
      email,
      password: hashedPassword,
      gender: 'OTHER',
      nacionality: 'nacionality',
      name: 'Admin',
      number: '00',
      phone: '00000000000',
      street: 'street',
      professionalPhone: '00000000000',
    }
  });

  console.log('Usuário administrador criado');
})()
