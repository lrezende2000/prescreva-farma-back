import * as yup from "yup";
import { AppointmentStatus } from "@prisma/client";

export const createAppointmentSchema = yup
  .object()
  .shape({
    date: yup
      .date()
      .typeError('Data no formato errado')
      .required("Data é obrigatória"),
    start: yup
      .string()
      .max(100, "Nome precisa ter menos de 100 caracteres")
      .required("Nome é obrigatório"),
    end: yup
      .date()
      .typeError('Data no formato errado')
      .required("Data de nascimento é obrigatória"),
    status: yup
      .mixed()
      .oneOf(
        Object.keys(AppointmentStatus).map((status) => status),
        "Status incorreto"
      )
      .required("Status é obrigatório"),
    patientId: yup
      .number()
      .integer()
      .required("Paciente é obrigatório"),
    professionalId: yup
      .number()
      .integer()
      .required("Profissional é obrigatório"),
  }).noUnknown();
