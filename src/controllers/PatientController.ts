import express from 'express';
import * as yup from 'yup';

import { prismaClient } from '../database/client';
import { createPacientService } from '../services/Patient/createPatientService';
import { createPatientSchema } from '../validations/Patient';

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
    include: {
      appointments: {
        where: {
          start: {
            gte: new Date(),
          },
        },
        take: 1,
      }
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

router.get('/:id', async (req, res) => {
  const { params: { id }, user } = req;

  const patient = await prismaClient.patient.findFirst({
    where: {
      id: parseInt(id),
      professionalId: user?.id,
    }
  });

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  return res.json({
    error: false,
    patient,
  });
});

router.put('/:id', async (req, res) => {
  const { params: { id }, body, user } = req;

  const patient = await prismaClient.patient.findFirst({
    where: {
      id: parseInt(id),
      professionalId: user?.id,
    },
  });

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  const data = await createPatientSchema.validate({ ...body, professionalId: user?.id });

  await prismaClient.patient.update({
    where: {
      id: patient.id,
    },
    data,
  });

  return res.json({
    error: false,
    message: 'Paciente editado com sucesso',
  });
})

router.delete('/:id', async (req, res) => {
  const { params: { id }, user } = req;

  const patient = await prismaClient.patient.findFirst({
    where: {
      id: parseInt(id),
      professionalId: user?.id,
    },
    select: {
      id: true,
      _count: true,
    }
  });

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  if (Object.values(patient._count).some(count => count > 0)) {
    return res.json({
      error: true,
      message: 'Não foi possível deletar esse paciente, pois tem registros associados a ele',
    });
  }

  await prismaClient.patient.delete({
    where: {
      id: patient.id,
    },
  });

  return res.json({
    error: false,
    message: 'Paciente deletado com sucesso',
  });
});

export default router;
