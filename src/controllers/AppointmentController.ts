import express from 'express';
import moment from 'moment';
import * as yup from 'yup';
import { Appointment } from '@prisma/client';

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
}

router.get('/list', async (req, res) => {
  const { user } = req;
  const { page = 1, pageSize = 15, ...params } = req.query as IQuery;

  const schema = yup.object().shape({
    patientId: yup.number().integer("Id do paciente errado"),
  }).noUnknown();

  const search = await schema.validate(params);

  const appointments = await prismaClient.appointment.findMany({
    where: {
      patientId: search.patientId,
      professionalId: user?.id
    },
    include: {
      patient: true,
    },
    skip: (page * pageSize) - pageSize,
    take: pageSize,
    orderBy: {
      start: 'desc'
    }
  });

  const appointmentsCount = await prismaClient.appointment.count({
    where: {
      patientId: search.patientId,
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
      start: 'desc'
    }
  });

  return res.json({
    error: false,
    rows: appointments,
  });
});

interface IQueryCalendar {
  month: number;
  year: number;
  patientId?: number;
  cpf?: string;
}

router.get('/calendar', async (req, res) => {
  const { user } = req;
  const { ...search } = req.query as unknown as IQueryCalendar

  const schema = yup.object().shape({
    cpf: yup.string(),
    patientId: yup.number().integer("Id do paciente errado"),
    month: yup.number().integer("Mês inválido").required("Mês é obrigatório"),
    year: yup.number().integer("Ano inválido").required("Ano é obrigatório"),
  }).noUnknown();

  const { cpf, month, patientId, year } = await schema.validate(search);

  const startOfMonth = moment.utc().month(month).year(year).startOf('month').toDate()
  const endOfMonth = moment.utc().month(month).year(year).hour(23).minute(59).endOf('month').toDate()

  const appointments = await prismaClient.appointment.findMany({
    where: {
      professionalId: user?.id,
      patientId,
      patient: {
        cpf: {
          contains: cpf
        }
      },
      start: {
        gte: startOfMonth
      },
      end: {
        lte: endOfMonth
      }
    },
    include: {
      patient: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      start: 'asc'
    },
  });

  const calendar: { [key: string]: Appointment[] } = {};

  appointments.forEach((appointment: Appointment) => {
    const appointmentDate = moment(appointment.start).format('YYYY-MM-DD');

    if (appointmentDate in calendar) {
      calendar[appointmentDate].push(appointment);
    } else {
      calendar[appointmentDate] = [appointment];
    }
  });

  return res.json({
    error: false,
    rows: appointments,
    rowsGrouped: calendar,
  });
});

router.delete('/:id', async (req, res) => {
  const { params: { id }, user } = req;

  const foundAppointment = await prismaClient.appointment.findFirst({
    where: {
      id: parseInt(id),
      professionalId: user?.id,
    },
  });

  if (!foundAppointment) {
    throw new Error('Consulta não encontrada');
  }

  await prismaClient.appointment.delete({
    where: {
      id: parseInt(id),
    },
  });

  return res.json({ error: false, message: 'Consulta deletada' });
});

export default router;
