import { Gender } from "@prisma/client";
import * as yup from "yup";

export const createUserSchema = yup
  .object()
  .shape({
    email: yup
      .string()
      .email("Email no formato errado")
      .required("Email é obrigatório"),
    crf: yup
      .string()
      .matches(/\d{4}/, "CRF no formato errado")
      .required("CRF é obrigatório"),
    crfState: yup
      .string()
      .matches(/[a-z]{2}/i, "Estado do CRF deve conter 2 letras")
      .required("Estado do CRF é obrigatório"),
    name: yup
      .string()
      .max(100, "Nome precisa ter menos de 100 caracteres")
      .required("Nome é obrigatório"),
    cpf: yup
      .string()
      .matches(/^\d{11}$/, "CPF no formato errado")
      .required("CPF é obrigatório"),
    birthDate: yup
      .date()
      .required("Data de nascimento é obrigatória"),
    gender: yup
      .mixed()
      .oneOf(
        Object.keys(Gender).map((gender) => gender),
        "Gênero errado"
      )
      .required("Gênero é obrigatório"),
    nacionality: yup
      .string()
      .max(50, "Nacionalidade precisa ter menos de 50 caracteres")
      .required("Nacionalidade é obrigatória"),
    password: yup
      .string()
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(20, "Senha de ter no máximo 20 caracteres")
      .required("Senha é obrigatória"),
    cep: yup
      .string()
      .matches(/\d{8}/, "CEP no formato errado")
      .required("CEP é obrigatório"),
    street: yup
      .string()
      .required("Rua é obrigatório"),
    district: yup
      .string()
      .required("Bairro é obrigatório"),
    complement: yup.string(),
    number: yup
      .string()
      .required("Número é obrigatório"),
    city: yup
      .string()
      .required("Cidade é obrigatória"),
    state: yup
      .string()
      .matches(/[a-z]{2}/i, "Estado deve conter 2 letras")
      .required("Estado é obrigatório"),
    tel: yup
      .string()
      .matches(/^\d{10}$/, "Telefone no formato errado")
      .nullable()
      .transform((value) => !!value ? value : null),
    phone: yup
      .string()
      .matches(/\d{11}/, "Celular no formato errado")
      .required("Celular é obrigatório"),
    logo: yup.string().required("Logo é obrigatória")
  })
  .noUnknown();

export const updateUserSchema = yup
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
        "Gênero errado"
      )
      .required("Gênero é obrigatório"),
    nacionality: yup
      .string()
      .max(50, "Nacionalidade precisa ter menos de 50 caracteres")
      .required("Nacionalidade é obrigatória"),
    cep: yup
      .string()
      .matches(/\d{8}/, "CEP no formato errado")
      .required("CEP é obrigatório"),
    street: yup
      .string()
      .required("Rua é obrigatório"),
    district: yup
      .string()
      .required("Bairro é obrigatório"),
    complement: yup.string(),
    number: yup
      .string()
      .required("Número é obrigatório"),
    city: yup
      .string()
      .required("Cidade é obrigatória"),
    state: yup
      .string()
      .matches(/[a-z]{2}/i, "Estado deve conter 2 letras")
      .required("Estado é obrigatório"),
    tel: yup
      .string()
      .matches(/^\d{10}$/, "Telefone no formato errado"),
    phone: yup
      .string()
      .matches(/\d{11}/,)
      .required("Celular é obrigatório"),
  })
  .noUnknown();
