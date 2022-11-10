import express from "express";
import * as yup from 'yup';
import { prismaClient } from "../database/client";
import admin from "../middlewares/admin";

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

interface IQuery {
  page?: number
  pageSize?: number
  professionalId?: number
}

router.get('/', admin, async (req, res) => {
  const { page = 1, pageSize = 15, ...params } = req.query as IQuery

  const schema = yup.object().shape({
    professionalId: yup.number().integer("Id do paciente errado"),
    grade: yup.number().integer("Nota deve ser um inteiro"),
  });

  const search = await schema.validate(params);

  const avaliations = await prismaClient.avaliation.findMany({
    where: {
      ...search,
    },
    include: {
      professional: {
        select: {
          name: true,
        }
      }
    },
    skip: (page * pageSize) - pageSize,
    take: pageSize,
    orderBy: {
      grade: 'asc'
    }
  });

  const avaliationsCount = await prismaClient.avaliation.count();

  return res.json({
    error: false,
    rows: avaliations,
    totalRows: avaliationsCount
  })
});

export default router;
