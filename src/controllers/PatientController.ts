import express from 'express';
import * as yup from 'yup';

import { prismaClient } from '../database/client';
import { createPacientService } from '../services/Patient/createPatientService';

const router = express.Router();

router.post('/', async (req, res) => {
  const { user, body } = req;

  const data = { ...body, professionalId: user?.id };

  const pacient = await createPacientService(data);

  return res.status(201).json({
    error: false,
    message: 'Paciente cadastrado com sucesso',
    pacient,
  });
});

interface IQuery {
  page?: number
  pageSize?: number
  name?: string
  cpf?: string
}

router.get('/list', async (req, res) => {
  const { user } = req;
  const { page = 1, pageSize = 15, ...params } = req.query as IQuery;

  const schema = yup.object().shape({
    name: yup.string(),
    cpf: yup.string(),
  }).noUnknown();

  const search = await schema.validate(params);

  const patients = await prismaClient.patient.findMany({
    where: {
      name: {
        contains: search.name,
        mode: 'insensitive'
      },
      cpf: {
        contains: search.cpf,
        mode: 'insensitive'
      },
      professionalId: user?.id
    },
    skip: (page * pageSize) - pageSize,
    take: pageSize,
    orderBy: {
      name: 'asc'
    }
  });

  const patientsCount = await prismaClient.patient.count({
    where: {
      name: {
        contains: search.name,
        mode: 'insensitive'
      },
      cpf: {
        contains: search.cpf,
        mode: 'insensitive'
      },
      professionalId: user?.id
    },
  });

  return res.json({
    error: false,
    rows: patients,
    totalRows: patientsCount
  });
});

router.get('/list/all', async (req, res) => {
  const { user } = req;

  const patients = await prismaClient.patient.findMany({
    where: {
      professionalId: user?.id
    },
    orderBy: {
      name: 'asc'
    }
  });

  return res.json({
    error: false,
    rows: patients,
  });
});

export default router;
