import { Appointment } from "@prisma/client";
import moment from "moment";

import { prismaClient } from "../../database/client";
import { createAppointmentSchema } from "../../validations/Appointment";

type CreateAppointmentType = Omit<Appointment, "id">;

export const createAppointmentService = async (data: CreateAppointmentType) => {
  const validatedData = await createAppointmentSchema.validate(data);

  const foundAppointment = await prismaClient.appointment.findFirst({
    where: {
      professionalId: validatedData.professionalId,
      OR: [
        {
          AND: {
            start: { lte: moment.utc(data.start).toDate() },
            end: { gt: moment.utc(data.start).toDate() }
          }
        },
        {
          AND: {
            start: { lt: moment.utc(data.end).toDate() },
            end: { gte: moment.utc(data.end).toDate() }
          }
        },
        {
          start: { gte: moment.utc(data.start).toDate() },
          end: { lte: moment.utc(data.end).toDate() }
        }
      ]
    },
    select: {
      patient: {
        select: {
          name: true,
        }
      }
    }
  });

  if (foundAppointment) {
    throw new Error(`Já tem uma consulta neste horário com ${foundAppointment.patient.name}`)
  }

  const appointment = await prismaClient.appointment.create({
    data: validatedData,
  });

  return appointment;
};
