import express from 'express';
import * as yup from 'yup';
import { AppointmentStatus } from '@prisma/client';

import { prismaClient } from '../database/client';
import { createAppointmentService } from '../services/Appointment/createAppointmentService';

const router = express.Router();

router.post('/', async (req, res) => {
  const { user, body } = req;

  const data = { ...body, professionalId: user?.id };

  const appointment = await createAppointmentService(data);

  return res.status(201).json({
    error: false,
    message: 'Consulta cadastrada com sucesso',
    appointment,
  });
});

interface IQuery {
  page?: number
  pageSize?: number
  patientId?: number
  date?: string
  status?: string
}

router.get('/list', async (req, res) => {
  const { user } = req;
  const { page = 1, pageSize = 15, ...params } = req.query as IQuery;

  const schema = yup.object().shape({
    patientId: yup.number().integer("Id do paciente errado"),
    date: yup.date(),
    status: yup
      .mixed()
      .oneOf(Object.keys(AppointmentStatus).map((status) => status)),
  }).noUnknown();

  const search = await schema.validate(params);

  const appointments = await prismaClient.appointment.findMany({
    where: {
      patientId: search.patientId,
      date: search.date,
      status: search.status,
      professionalId: user?.id
    },
    skip: (page * pageSize) - pageSize,
    take: pageSize,
    orderBy: {
      date: 'desc'
    }
  });

  const appointmentsCount = await prismaClient.appointment.count({
    where: {
      patientId: search.patientId,
      date: search.date,
      status: search.status,
      professionalId: user?.id
    },
  });

  return res.json({
    error: false,
    rows: appointments,
    totalRows: appointmentsCount
  });
});

router.get('/list/all', async (req, res) => {
  const { user } = req;

  const appointments = await prismaClient.appointment.findMany({
    where: {
      professionalId: user?.id
    },
    orderBy: {
      date: 'desc'
    }
  });

  return res.json({
    error: false,
    rows: appointments,
  });
});

export default router;
