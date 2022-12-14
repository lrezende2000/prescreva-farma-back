import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";
import bcrypt from "bcryptjs";
import * as yup from "yup";

import { prismaClient } from "../database/client";

import admin from "../middlewares/admin";
import { createUserService } from "../services/User/createUserService";

const router = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.env.UPLOAD_DIR as string, 'logos'))
  },
  filename: function (req, file, cb) {
    const fileName = uuid();
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
    cb(null, fileName + ext)
  }
});
const upload = multer({
  storage: storage
}).any();


interface IQuery {
  page?: number
  pageSize?: number
  name?: string
  email?: string
}

router.get("/list", admin, async (req, res) => {
  const { page = 1, pageSize = 15, ...params } = req.query as IQuery

  const schema = yup.object().shape({
    name: yup.string(),
    email: yup.string(),
  }).noUnknown();

  const search = await schema.validate(params)

  const users = await prismaClient.user.findMany({
    where: {
      name: {
        contains: search.name,
        mode: 'insensitive'
      },
      email: {
        contains: search.email,
        mode: 'insensitive',
      },
      isAdmin: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    skip: (page * pageSize) - pageSize,
    take: pageSize,
    orderBy: {
      name: 'asc'
    }
  })

  const usersCount = await prismaClient.user.count({
    where: {
      name: {
        contains: search.name,
        mode: 'insensitive'
      },
      email: {
        contains: search.email,
        mode: 'insensitive',
      }
    },
  })

  return res.json({
    error: false,
    rows: users,
    totalRows: usersCount
  })
});

router.get("/list/all", admin, async (req, res) => {
  const users = await prismaClient.user.findMany({
    where: {
      isAdmin: false,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc'
    }
  })

  return res.json({
    error: false,
    rows: users,
  })
});

router.post("/", admin, upload, async (req, res) => {
  const { body } = req;
  const json = JSON.parse(body?.json);

  let file;
  if (Array.isArray(req.files)) {
    file = req.files[0];
  } else if (req.files) {
    file = req.files;
  }

  if (file) {
    json.logo = file.filename;
  }

  const url = req.origin ? `${req.origin}/entrar/` : '';

  const professional = await createUserService(json, url);

  if (!professional) {
    throw new Error("N??o foi poss??vel criar sua conta");
  }

  return res.status(201).json({
    error: false,
    message: "Usu??rio criado com sucesso",
  });
});

router.delete("/:id", admin, async (req, res) => {
  try {
    const userId = req.params.id;

    await prismaClient.refreshToken.deleteMany({
      where: {
        userId: parseInt(userId)
      }
    })

    await prismaClient.avaliation.deleteMany({
      where: {
        professionalId: parseInt(userId)
      }
    })

    await prismaClient.forgotPasswordToken.deleteMany({
      where: {
        userId: parseInt(userId)
      }
    })

    await prismaClient.prescriptionMedicines.deleteMany({
      where: {
        prescription: {
          professionalId: parseInt(userId)
        }
      }
    })

    await prismaClient.prescription.deleteMany({
      where: {
        professionalId: parseInt(userId)
      }
    })

    await prismaClient.appointment.deleteMany({
      where: {
        professionalId: parseInt(userId)
      }
    })

    await prismaClient.forward.deleteMany({
      where: {
        professionalId: parseInt(userId)
      }
    })

    await prismaClient.patient.deleteMany({
      where: {
        professionalId: parseInt(userId)
      }
    })

    await prismaClient.user.delete({
      where: {
        id: parseInt(userId)
      }
    })

    return res.json({
      error: false,
      message: "Usu??rio deletado com sucesso",
    });
  } catch {
    return res.json({
      error: true,
      message: 'N??o foi poss??vel deletar o usu??rio'
    })
  }
});

router.get("/profile", async (req, res) => {
  const { user: loggedUser } = req;

  const user = await prismaClient.user.findUnique({
    where: {
      id: loggedUser?.id,
    }
  });

  const returnUser = { ...user };

  delete returnUser.password
  delete returnUser.token;

  return res.json({
    error: false,
    user: returnUser
  });
});


router.put("/", upload, async (req, res) => {
  const { body, user } = req;
  const json = JSON.parse(body?.json);

  let file;
  if (Array.isArray(req.files)) {
    file = req.files[0];
  } else if (req.files) {
    file = req.files;
  }

  if (file) {
    json.logo = file.filename;
  }

  const professional = await prismaClient.user.findUnique({
    where: {
      id: user?.id
    }
  });

  if (!professional) {
    if (file) {
      // @ts-ignore
      fs.unlinkSync(path.join(process.env.UPLOAD_DIR as string, 'logos', file.filename));
    }

    throw new Error("N??o foi poss??vel alterar o usu??rio");
  }

  if (json.email) {

    const foundEmail = await prismaClient.user.findFirst({
      where: {
        id: {
          not: user?.id
        },
        email: json.email
      }
    });

    if (foundEmail) {
      throw new Error("Email j?? existe");
    }
  }

  const updatedProfessional = await prismaClient.user.update({
    where: {
      id: professional.id,
    },
    data: { ...json },
  });

  if (professional.logo && (!updatedProfessional.logo || file)) {
    fs.unlinkSync(path.join(process.env.UPLOAD_DIR as string, 'logos', professional.logo));
  }

  return res.json({
    error: false,
    message: "Usu??rio alterado com sucesso",
  });
});

router.put("/changePassword", async (req, res) => {
  const { password, newPassword, newPasswordConfirmation } = req.body;
  const { user: loggedUser } = req;

  const schema = yup.object().shape({
    password: yup.string().required("Senha atual obrigat??ria"),
    newPassword: yup.string()
      .min(6, 'Senha deve ter no m??nimo 6 caracteres')
      .required('Nova senha ?? obrigat??ria'),
    newPasswordConfirmation: yup.string().required("Confirma????o de senha ?? obrigat??ria").oneOf([yup.ref('newPassword'), null], 'Senhas n??o conferem'),
  }).noUnknown();

  await schema.validate({ password, newPassword, newPasswordConfirmation });

  const user = await prismaClient.user.findUnique({ where: { id: loggedUser?.id } });

  if (!user) {
    throw new Error('Usu??rio n??o encontrado');
  }

  const passwordMatch = await bcrypt.compare(password, user.password as string);

  if (!passwordMatch) {
    throw new Error('Senha n??o confere com a atual');
  }

  const passwordHash = await bcrypt.hash(newPassword, 11);

  await prismaClient.user.update({
    where: { id: loggedUser?.id },
    data: {
      password: passwordHash,
    }
  });

  return res.json({
    error: false,
    message: 'Senha alterada com sucesso'
  });
});

export default router;
