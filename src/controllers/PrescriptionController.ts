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
    medicines: yup.string()
  }).noUnknown();

  const { medicines, ...search } = await schema.validate(params);

  const prescriptions = await prismaClient.prescription.findMany({
    where: {
      ...search,
      prescriptionMedicines: {
        some: {
          medicineId: {
            in: medicines ? medicines.split(',').map(id => parseInt(id)) : undefined
          }
        }
      },
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
    orderBy: {
      createdAt: 'desc',
    }
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
});

interface IQueryPreview {
  patientId?: string;
  medicines?: string;
}

router.get("/preview", async (req, res) => {
  const { user } = req;
  const { medicines, patientId } = req.query as IQueryPreview;

  let patient = null, medicinesReturn: { name: string; pharmaceuticalForm: string; }[] = [];

  const professional = await prismaClient.user.findUnique({
    where: {
      id: user?.id,
    },
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
  });

  if (!professional) {
    throw new Error("Profissional não encontrado");
  }

  if (patientId) {
    patient = await prismaClient.patient.findFirst({
      where: {
        id: parseInt(patientId),
        professionalId: user?.id,
      }
    });
  }

  if (!patient) {
    throw new Error("Paciente não encontrado");
  }

  if (medicines) {
    const medicineIds = medicines.split(",");

    medicinesReturn = await prismaClient.medicine.findMany({
      where: {
        id: {
          in: medicineIds.map(mId => parseInt(mId))
        }
      },
      select: {
        id: true,
        name: true,
        pharmaceuticalForm: true,
      }
    });
  }

  return res.json({
    error: false,
    medicines: medicinesReturn,
    patient,
    professional,
  });
});

router.get('/:id', async (req, res) => {
  const { params: { id }, user } = req;

  const prescription = await prismaClient.prescription.findFirst({
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
      prescriptionMedicines: {
        select: {
          medicine: {
            select: {
              name: true,
              pharmaceuticalForm: true,
            }
          },
          concentration: true,
          administrationForm: true,
          instructions: true,
        }
      }
    }
  });

  if (!prescription) {
    throw new Error("Prescrição não encontrada");
  }

  return res.json({
    error: false,
    prescription,
  });
});

router.delete('/:id', async (req, res) => {
  const { params: { id }, user } = req;

  const foundPrescription = await prismaClient.prescription.findFirst({
    where: {
      id: parseInt(id),
      professionalId: user?.id,
    }
  });

  if (!foundPrescription) {
    throw new Error('Prescrição não encontrada');
  }

  await prismaClient.prescriptionMedicines.deleteMany({
    where: {
      prescriptionId: parseInt(id),
    }
  });

  await prismaClient.prescription.delete({
    where: {
      id: parseInt(id),
    },
  });

  return res.json({ error: false, message: 'Prescrição deletada' });
});

export default router;