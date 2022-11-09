import express from "express";
import * as yup from 'yup';
import { prismaClient } from "../database/client";

const router = express.Router();

router.post('/', async (req, res) => {
  const { user, body } = req;

  const schema = yup.object().shape({
    grade: yup.number().integer("Nota deve ser um número inteiro").required("Nota é obrigatória"),
    comment: yup.string(),
    professionalId: yup.number().integer("Profissional é obrigatório").required("Profissional é obrigatório")
  }).noUnknown();

  const data = await schema.validate({ ...body, professionalId: user?.id });

  await prismaClient.avaliation.create({
    data,
  });

  return res.json({ error: false, message: "Obrigado pela sua avaliação!" });
});

export default router;
