import { match } from "assert";
import * as yup from "yup";

export const createProfessionalSchema = yup
  .object()
  .shape({
    professionalEmail: yup
      .string()
      .email("Email profissional no formato errado")
      .nullable(),
    crf: yup
      .string()
      .max(20, "CRF não pode contar mais de 20 caracteres")
      .required("CRF é obrigatório"),
    cep: yup
      .string()
      .max(8, "CEP não pode contar mais de 8 caracteres")
      .nullable(),
    street: yup
      .string()
      .max(100, "Rua não pode contar mais de 100 caracteres")
      .nullable(),
    district: yup
      .string()
      .max(50, "Bairro não pode contar mais de 50 caracteres")
      .nullable(),
    complement: yup
      .string()
      .max(150, "Complemento não pode contar mais de 150 caracteres")
      .nullable(),
    number: yup
      .string()
      .max(10, "Número do endereço não pode contar mais de 10 caracteres")
      .nullable(),
    tel: yup
      .string()
      .matches(/^^\d{10}$$/, "Telefone no formato errado")
      .nullable(),
    phone: yup
      .string()
      .matches(/^\d{11}$/, "Celular no formato errado")
      .required("Celular é obrigatório"),
    userId: yup
      .number()
      .integer("user_id inválido")
      .required("user_id é obrigatório"),
  })
  .noUnknown();
