import { Appointment } from "@prisma/client";
import moment from "moment";

import { prismaClient } from "../../database/client";
import { createAppointmentSchema } from "../../validations/Appointment";

type CreateAppointmentType = Omit<Appointment, "id">;

export const createAppointmentService = async (data: CreateAppointmentType) => {
  const validatedData = await createAppointmentSchema.validate(data);

  const appointment = await prismaClient.appointment.create({
    data: validatedData,
  });

  return appointment;
};
