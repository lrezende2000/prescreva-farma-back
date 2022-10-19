import express from 'express';
import { createPacientService } from '../services/Pacient/createPacientService';

const router = express.Router();

router.post('/', async (req, res) => {
  const { user, body } = req;

  const data = { ...body, professionalId: user?.id }

  const pacient = await createPacientService(data);

  return res.status(201).json({
    error: false,
    message: 'Paciente cadastrado com sucesso',
    pacient,
  });
});

export default router;
