import express from 'express';
import rateLimit, { MemoryStore, Options } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as yup from 'yup';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import path from 'path';

import { prismaClient } from '../database/client';
import { createRefreshTokenService } from '../services/RefreshToken/createRefreshTokenService';
import { updateUserTokenService } from '../services/User/updateUserTokenService';
import { refreshUserCredentialsService } from '../services/User/refreshUserCredentialsService';
import { removeUserCredentialsService } from '../services/User/removeUserCredentialsService';
import { deleteRefreshTokenByIdService } from '../services/RefreshToken/deleteRefreshTokenService';
import { createUserService } from '../services/User/createUserService';

const router = express.Router();
const MS_IN_MINUTE = 1000 * 60;
const MS_IN_DAY = 24 * 60 * MS_IN_MINUTE;
export const COOKIE_REFRESH_TOKEN_KEY = 'prescreva_farma@rftoken';

const rateLimitConfig: Partial<Options> = {
  windowMs: 5 * MS_IN_MINUTE,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: function (_, res) {
    return res.status(429).json({
      error: true,
      message: 'Muitas requisições, tente novamente mais tarde',
    });
  },
};

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

router.post("/signup", upload, async (req, res) => {
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

  const professional = await createUserService(json);

  if (!professional) {
    throw new Error("Não foi possível criar sua conta");
  }

  return res.status(201).json({
    error: false,
    message: "Usuário criado com sucesso",
  });
});

router.post(
  '/login',
  rateLimit({
    ...rateLimitConfig,
    store: new MemoryStore(),
  }),
  async (req, res) => {
    const { login, password } = req.body;

    const user = await prismaClient.user.findFirst({
      where: {
        email: login,
      },
      select: {
        id: true,
        name: true,
        password: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    if (!user.password) {
      throw new Error('Você ainda não possui uma senha, por favor clique em \'Esqueci minha senha\'');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Login ou senha incorretos');
    }

    const token = await updateUserTokenService(user.id);

    const refreshToken = await createRefreshTokenService(user.id);

    res.cookie(COOKIE_REFRESH_TOKEN_KEY, refreshToken, { secure: true, httpOnly: true, maxAge: MS_IN_DAY, sameSite: 'none' });

    const returnUser = {
      id: user.id,
      name: user.name,
      token,
    };

    return res.json({
      error: false,
      message: 'Login efetuado com sucesso',
      user: returnUser,
    });
  });

interface IRefreshTokenPayload {
  rfId: string;
  iat: number;
}

router.get(
  '/refresh',
  async (req, res) => {
    try {
      const cookies = req.cookies;

      if (!cookies?.[COOKIE_REFRESH_TOKEN_KEY]) {
        throw new Error("Token não encontrado");
      }

      const { rfId } = jwt.verify(cookies[COOKIE_REFRESH_TOKEN_KEY], process.env.REFRESH_TOKEN_SECRET) as IRefreshTokenPayload;

      const data = await refreshUserCredentialsService(rfId);

      if (!data) {
        res.clearCookie(COOKIE_REFRESH_TOKEN_KEY, { httpOnly: true, sameSite: 'none', secure: true });
        await deleteRefreshTokenByIdService(rfId);
        throw new Error();
      }

      const { refreshToken, userId } = data;

      res.cookie(COOKIE_REFRESH_TOKEN_KEY, refreshToken, { secure: true, httpOnly: true, maxAge: MS_IN_DAY, sameSite: 'none' });

      const user = await prismaClient.user.findUnique({
        where: {
          id: userId
        },
        select: {
          id: true,
          name: true,
          token: true,
        }
      });

      return res.json({
        error: false,
        user,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        return res.status(403).json({
          error: true,
          message: 'Token inválido ou expirado! Logue-se novamente',
        });
      }
    }
  });

router.post('/logout', async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.[COOKIE_REFRESH_TOKEN_KEY]) return res.status(204).send('');
  const refreshTokenCookie = cookies[COOKIE_REFRESH_TOKEN_KEY];

  const { rfId } = jwt.verify(refreshTokenCookie, process.env.REFRESH_TOKEN_SECRET) as IRefreshTokenPayload;

  const user = await prismaClient.user.findFirst({ where: { refreshToken: { some: { id: rfId } } } });

  if (!user) {
    res.clearCookie(COOKIE_REFRESH_TOKEN_KEY, { secure: true, httpOnly: true, sameSite: 'none' });
    return res.status(204).send('');
  }

  // Delete refreshToken in db
  await removeUserCredentialsService(user.id);

  res.clearCookie(COOKIE_REFRESH_TOKEN_KEY, { secure: true, httpOnly: true, sameSite: 'none' });
  return res.status(204).send('');
});

router.post(
  '/forgotPassword',
  rateLimit({
    ...rateLimitConfig,
    store: new MemoryStore(),
  }),
  async (req, res) => {
    try {
      const schema = yup.object().shape({
        login: yup.string().required(),
      }).noUnknown();

      const { body } = req;

      const data = await schema.validate(body);

      const user = await prismaClient.user.findFirst({
        where: {
          email: data.login,
        }
      });

      if (!user) {
        throw new Error();
      }

      // const token = generateToken({ userId: user.id }, MS_IN_MINUTE * 15);
      // await prismaClient.forgotPasswordToken.create({
      //   data: {
      //     token,
      //     userId: user.id,
      //   }
      // });

      // const url = `${req.origin}/resetPassword/?token=${token}`;
      // sendEmail(user.email.trim(), 'AGL WBF - Redefinição de senha', resetPasswordTemplate(user.name, url));

      return res.json({
        error: false,
        message: 'Se existir uma conta com esse usuário, então um e-mail será encaminhado com detalhes para o processo de recuperação',
      });
    } catch (err) {
      if (err instanceof Error) {
        return res.json({
          error: false,
          message: 'Se existir uma conta com esse usuário, então um e-mail será encaminhado com detalhes para o processo de recuperação',
        });
      }
    }
  });

// interface ITokenPayload {
//   userId: number;
//   profile: string;
//   iat: number;
//   exp: number;
//   sub: string;
// }

// router.post(
//   '/resetPassword',
//   rateLimit({
//     ...rateLimitConfig,
//     store: new MemoryStore(),
//   }),
//   tokenBlacklist,
//   async (req, res) => {
//     const authToken = req.headers.authorization;

//     if (!authToken) {
//       return res.status(400).json({
//         error: true,
//         message: 'Token é obrigatório',
//       });
//     }

//     const [tokenSchema, token] = authToken.split(' ');

//     if (!/^Bearer$/i.test(tokenSchema)) {
//       return res.status(400).json({
//         error: true,
//         message: 'Token em formato errado',
//       });
//     }

//     const data = jwt.verify(token, process.env.SECRET);
//     const { userId } = data as ITokenPayload;

//     const { newPassword, passwordConfirmation } = req.body;

//     const schema = yup.object().shape({
//       newPassword: yup.string()
//         .min(8, 'Senha deve ter no mínimo 8 caracteres')
//         .test({
//           name: 'Uppercase letter',
//           message: 'Senha deve contar uma letra maíuscula. Ex.: ABC...',
//           test: (value) => !!value?.match(/[A-Z]/),
//         })
//         .test({
//           name: 'Lowercase letter',
//           message: 'Senha deve contar uma letra minúscula. Ex.: abc...',
//           test: (value) => !!value?.match(/[a-z]/),
//         })
//         .test({
//           name: 'Special characters',
//           message:
//             'Senha deve conter um caracter especial. Ex.: (!@#$%.&*()_-=+)',
//           test: (value) =>
//             !!value?.match(/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/),
//         }).required(),
//       passwordConfirmation: yup.string().required().oneOf([yup.ref('newPassword'), null], 'Senhas não conferem'),
//     }).noUnknown();

//     await schema.validate({ newPassword, passwordConfirmation });

//     const user = await client.user.findUnique({ where: { id: userId } });

//     if (!user) {
//       throw new Error();
//     }

//     const passwordHash = await bcrypt.hash(newPassword, 8);
//     await client.user.update({
//       where: { id: userId },
//       data: {
//         password: passwordHash,
//         updatedAt: getUTCDate(),
//         token: null,
//       }
//     });

//     const forgotTokens = await client.forgotPasswordToken.findMany({
//       where: {
//         userId: user.id,
//       }
//     });

//     await client.tokenBlacklist.createMany({
//       data: forgotTokens.map(fT => ({ token: fT.token, createdAt: getUTCDate() })),
//     });
//     await client.forgotPasswordToken.deleteMany({ where: { userId: user.id } });

//     return res.json({
//       error: false,
//       message: 'Senha alterada com sucesso'
//     });
//   });

export default router;
