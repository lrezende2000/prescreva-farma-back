import * as yup from "yup";
import { Gender } from "@prisma/client";

export const createPatientSchema = yup
  .object()
  .shape({
    email: yup
      .string()
      .email("Email no formato errado"),
    name: yup
      .string()
      .max(100, "Nome precisa ter menos de 100 caracteres")
      .required("Nome é obrigatório"),
    birthDate: yup
      .date()
      .typeError('Data no formato errado')
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
    tel: yup
      .string()
      .matches(/^\d{10}$/, "Telefone no formato errado")
      .nullable()
      .transform((value) => !!value ? value : null),
    phone: yup
      .string()
      .matches(/^\d{11}$/,)
      .required("Celular é obrigatório"),
    cpf: yup
      .string()
      .matches(/^\d{11}$/, "CPF no formato errado")
      .required("CPF é obrigatório"),
    professionalId: yup
      .number()
      .integer()
      .required("Profissional é obrigatório"),
  }).noUnknown();
