import express from 'express';
import * as yup from 'yup';

import { prismaClient } from '../database/client';
import { createPrescriptionService } from '../services/Prescription/createPrescriptionService';

const router = express.Router();

router.post('/', async (req, res) => {
  const { user, body } = req;

  const data = { ...body, professionalId: user?.id }

  const prescription = await createPrescriptionService(data);

  return res.status(201).json({
    error: false,
    message: 'Prescrição gerada com sucesso',
    prescription,
  })
});

interface IQuery {
  page?: number
  pageSize?: number
  patientId?: number
  // date?: string
}

router.get('/list', async (req, res) => {
  const { user } = req;
  const { page = 1, pageSize = 15, ...params } = req.query as IQuery;

  const schema = yup.object().shape({
    patientId: yup.number().integer("Id do paciente errado"),
    // date: yup.date(),
  }).noUnknown();

  const search = await schema.validate(params);

  const prescriptions = await prismaClient.prescription.findMany({
    where: {
      ...search,
      professionalId: user?.id,
    },
    include: {
      patient: {
        select: { name: true }
      },
      prescriptionMedicines: {
        include: {
          medicine: {
            select: {
              name: true
            }
          }
        }
      }
    },
    skip: (page * pageSize) - pageSize,
    take: pageSize,
  });

  const prescriptionsCount = await prismaClient.prescription.count({
    where: {
      ...search,
      professionalId: user?.id,
    }
  });

  return res.json({
    error: false,
    rows: prescriptions,
    totalRows: prescriptionsCount
  });
})

export default router;