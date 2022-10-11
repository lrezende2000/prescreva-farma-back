import { Gender } from "@prisma/client";
import * as yup from "yup";

export const createUserSchema = yup
  .object()
  .shape({
    email: yup
      .string()
      .email("Email no formato errado")
      .required("Email é obrigatório"),
    name: yup
      .string()
      .max(100, "Nome precisa ter menos de 100 caracteres")
      .required("Nome é obrigatório"),
    nick: yup.string().max(20, "Nome precisa ter menos de 20 caracteres"),
    cpf: yup
      .string()
      .matches(/^\d{11}$/, "CPF no formato errado")
      .required("CPF é obrigatório"),
    birthDate: yup
      .string()
      .matches(
        /^(0[1-9]|[12][0-9]|3[01])(\/|-)(0?[1-9]|1[012])(\/|-)(19|20)\d{2}$/,
        "Data de nascimento no formato errado"
      )
      .required("Data de nascimento é obrigatória"),
    gender: yup
      .mixed()
      .oneOf(
        Object.keys(Gender).map((gender) => gender),
        "Não é um valor possível para gênero"
      )
      .required("Gênero é obrigatório"),
    nacionality: yup
      .string()
      .max(50, "Nacionalidade precisa ter menos de 50 caracteres")
      .required("Nacionalidade é obrigatória"),
    password: yup
      .string()
      .min(5, "Senha deve ter no mínimo 5 caracteres")
      .max(20, "Senha de ter no máximo 20 caracteres")
      .required("Senha é obrigatória"),
  })
  .noUnknown();
