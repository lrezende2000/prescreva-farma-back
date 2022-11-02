import express from 'express'
import * as yup from 'yup'

import { prismaClient } from '../database/client';

const router = express.Router()

interface IQuery {
  page?: number
  pageSize?: number
  name?: string
  subGroup?: string
  pharmaceuticalForm?: string
  therapeuticIndication?: string
}

router.get('/list', async (req, res) => {
  const { page = 1, pageSize = 15, ...params } = req.query as IQuery

  const schema = yup.object().shape({
    name: yup.string(),
    subGroup: yup.string(),
    pharmaceuticalForm: yup.string(),
    therapeuticIndication: yup.string(),
  }).noUnknown();

  const search = await schema.validate(params)

  const medicines = await prismaClient.medicine.findMany({
    where: {
      name: {
        contains: search.name,
        mode: 'insensitive'
      },
      subGroup: {
        contains: search.subGroup,
        mode: 'insensitive'
      },
      pharmaceuticalForm: {
        contains: search.pharmaceuticalForm,
        mode: 'insensitive'
      },
      therapeuticIndication: {
        contains: search.therapeuticIndication,
        mode: 'insensitive'
      },
    },
    skip: (page * pageSize) - pageSize,
    take: pageSize,
    orderBy: {
      name: 'asc'
    }
  })

  const medicinesCount = await prismaClient.medicine.count({
    where: {
      name: {
        contains: search.name,
        mode: 'insensitive'
      },
      subGroup: {
        contains: search.subGroup,
        mode: 'insensitive'
      },
      pharmaceuticalForm: {
        contains: search.pharmaceuticalForm,
        mode: 'insensitive'
      },
      therapeuticIndication: {
        contains: search.therapeuticIndication,
        mode: 'insensitive'
      },
    },
  })

  return res.json({
    error: false,
    rows: medicines,
    totalRows: medicinesCount
  })
})

router.get('/list/all', async (_, res) => {
  const medicines = await prismaClient.medicine.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  return res.json({
    error: false,
    rows: medicines,
  })
})

export default router;