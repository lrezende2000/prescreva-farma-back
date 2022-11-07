import express from 'express';
import moment from 'moment';
import * as yup from 'yup';

import { prismaClient } from '../database/client';

const router = express.Router();

router.post('/', async (req, res) => {
  const { user, body } = req;

  const schema = yup.object().shape({
    professionalId: yup.number().integer("Profissional é obrigatório").required("Profissional é obrigatório"),
    patientId: yup.number().integer("Paciente é obrigatório").required("Paciente é obrigatório"),
    medicalExperience: yup.string().required("Especialidade é obrigatória"),
    forwardReason: yup.string().required("Motivo do encaminhamento é obrigatório"),
    showFooter: yup.boolean().default(false),
  }).noUnknown();

  const data = await schema.validate({ ...body, professionalId: user?.id });

  const forward = await prismaClient.forward.create({
    data
  });

  return res.status(201).json({
    error: false,
    message: 'Encaminhamento cadastrado com sucesso',
    forward,
  });
});

interface IQuery {
  page?: number
  pageSize?: number
  patientId?: number
  date?: string
}

router.get('/list', async (req, res) => {
  const { user } = req;
  const { page = 1, pageSize = 15, ...params } = req.query as IQuery;

  const schema = yup.object().shape({
    patientId: yup.number().integer("Id do paciente errado"),
    date: yup.string()
  }).noUnknown();

  const { date, ...search } = await schema.validate(params);

  const forward = await prismaClient.forward.findMany({
    where: {
      ...search,
      createdAt: date ? {
        gte: moment.utc(date).toDate(),
        lte: moment.utc(`${date} 23:59:59`).toDate()
      } : undefined,
      professionalId: user?.id
    },
    include: {
      patient: true,
    },
    skip: (page * pageSize) - pageSize,
    take: pageSize,
  });

  const forwardCount = await prismaClient.forward.count({
    where: {
      ...search,
      professionalId: user?.id
    },
  });

  return res.json({
    error: false,
    rows: forward,
    totalRows: forwardCount
  });
});

router.get('/list/all', async (req, res) => {
  const { user } = req;

  const forward = await prismaClient.forward.findMany({
    where: {
      professionalId: user?.id
    },
  });

  return res.json({
    error: false,
    rows: forward,
  });
});



router.get('/:id', async (req, res) => {
  const { params: { id }, user } = req;

  const forward = await prismaClient.forward.findFirst({
    where: {
      id: parseInt(id),
      professionalId: user?.id
    },
    include: {
      professional: {
        select: {
          logo: true,
          state: true,
          street: true,
          district: true,
          city: true,
          number: true,
          name: true,
          crf: true,
          crfState: true,
          professionalPhone: true,
        }
      },
      patient: {
        select: {
          name: true,
          phone: true,
          tel: true,
        }
      },
    }
  });

  if (!forward) {
    throw new Error("Prescrição não encontrada");
  }

  return res.json({
    error: false,
    forward,
  });
});

router.delete('/:id', async (req, res) => {
  const { params: { id }, user } = req;

  const foundForward = await prismaClient.forward.findFirst({
    where: {
      id: parseInt(id),
      professionalId: user?.id,
    },
  });

  if (!foundForward) {
    throw new Error('Encaminhamento não encontrado');
  }

  await prismaClient.forward.delete({
    where: {
      id: parseInt(id),
    },
  });

  return res.json({ error: false, message: 'Encaminhamento deletado' });
});

export default router;
