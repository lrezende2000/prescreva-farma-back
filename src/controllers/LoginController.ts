import express from 'express';
import rateLimit, { MemoryStore, Options } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as yup from 'yup';

import { prismaClient } from '../database/client';

const router = express.Router();
const MS_IN_MINUTE = 1000 * 60;
const MS_IN_DAY = 24 * 60 * MS_IN_MINUTE;
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
        nick: true,
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

    const token = jwt.sign({}, process.env.SECRET, {
      subject: user.id.toString(),
      expiresIn: 1000 * 60 * 10,
      issuer: 'http://localhost',
      audience: 'prescreve_farma'
    })
    const refreshToken = await generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, { secure: true, httpOnly: true, maxAge: MS_IN_DAY, sameSite: 'lax' });

    const newUser = {
      id: user.id,
      name: user.name,
      login: user.login,
      profile: user.profile.name
    };

    await client.user.update({
      where: {
        id: user.id,
      },
      data: {
        token,
      }
    });
    const permissions = await client.permission.findMany({
      where: {
        profilePermission: {
          some: {
            profile: {
              active: true,
              users: {
                some: {
                  id: user.id,
                  active: true,
                }
              }
            }
          }
        }
      }
    });
    const isLeader = !!(await client.project.findFirst({
      where: {
        users: {
          some: {
            userId: user.id,
            active: true,
          }
        }
      }
    }));

    return res.json({
      error: false,
      message: 'Login efetuado com sucesso',
      token,
      user: newUser,
      permissions,
      isLeader,
    });
  });

interface IRefreshTokenPayload {
  refreshTokenId: string;
  iat: number;
}

router.get(
  '/refresh',
  rateLimit({
    ...rateLimitConfig,
    store: new MemoryStore(),
  }),
  async (req, res) => {
    try {
      const cookies = req.cookies;

      if (!cookies?.refreshToken) {
        throw new Error();
      }

      const { refreshTokenId } = jwt.verify(cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET) as IRefreshTokenPayload;

      const data = await refreshTokenProvider(refreshTokenId);

      if (!data) {
        throw new Error();
      }

      const { token, refreshToken, userId, user } = data;

      if (!user) {
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
        await client.refreshToken.deleteMany({ where: { userId: userId } });
        throw new Error('Usuário não encontrado');
      }

      res.cookie('refreshToken', refreshToken, { secure: true, httpOnly: true, maxAge: MS_IN_DAY, sameSite: 'lax' });

      const newUser = {
        id: user.id,
        name: user.name,
        login: user.login,
        profile: user.profile.name
      };

      await client.user.update({
        where: {
          id: user.id,
        },
        data: {
          token,
        },
      });
      const permissions = await client.permission.findMany({
        where: {
          profilePermission: {
            some: {
              profile: {
                active: true,
                users: {
                  some: {
                    id: user.id,
                    active: true,
                  }
                }
              }
            }
          }
        }
      });
      const isLeader = !!(await client.project.findFirst({
        where: {
          users: {
            some: {
              userId: user.id,
              active: true,
            }
          }
        }
      }));

      return res.json({
        error: false,
        token,
        user: newUser,
        permissions,
        isLeader,
      });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(403).json({
          error: true,
          message: 'Token inválido ou expirado! Logue-se novamente',
        });
      }
    }
  });

router.post('/logout', async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.status(204).send('');
  const refreshToken = cookies.refreshToken;

  const { refreshTokenId } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as IRefreshTokenPayload;

  const user = await client.user.findFirst({ where: { refreshToken: { some: { id: refreshTokenId } } } });

  if (!user) {
    res.clearCookie('refreshToken', { secure: true, httpOnly: true, sameSite: 'lax' });
    return res.status(204).send('');
  }

  // Delete refreshToken in db
  await client.refreshToken.deleteMany({ where: { userId: user.id } });
  await client.user.update({
    where: {
      id: user.id,
    },
    data: {
      token: null,
    },
  });

  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
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

      const user = await client.user.findFirst({
        where: {
          OR: [{
            login: data.login,
          }, {
            email: data.login
          }],
          active: true,
        }
      });

      if (!user) {
        throw new Error();
      }

      const token = generateToken({ userId: user.id }, MS_IN_MINUTE * 15);
      await client.forgotPasswordToken.create({
        data: {
          token,
          userId: user.id,
        }
      });

      const url = `${req.origin}/resetPassword/?token=${token}`;
      sendEmail(user.email.trim(), 'AGL WBF - Redefinição de senha', resetPasswordTemplate(user.name, url));

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

interface ITokenPayload {
  userId: number;
  profile: string;
  iat: number;
  exp: number;
  sub: string;
}

router.post(
  '/resetPassword',
  rateLimit({
    ...rateLimitConfig,
    store: new MemoryStore(),
  }),
  tokenBlacklist,
  async (req, res) => {
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(400).json({
        error: true,
        message: 'Token é obrigatório',
      });
    }

    const [tokenSchema, token] = authToken.split(' ');

    if (!/^Bearer$/i.test(tokenSchema)) {
      return res.status(400).json({
        error: true,
        message: 'Token em formato errado',
      });
    }

    const data = jwt.verify(token, process.env.SECRET);
    const { userId } = data as ITokenPayload;

    const { newPassword, passwordConfirmation } = req.body;

    const schema = yup.object().shape({
      newPassword: yup.string()
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .test({
          name: 'Uppercase letter',
          message: 'Senha deve contar uma letra maíuscula. Ex.: ABC...',
          test: (value) => !!value?.match(/[A-Z]/),
        })
        .test({
          name: 'Lowercase letter',
          message: 'Senha deve contar uma letra minúscula. Ex.: abc...',
          test: (value) => !!value?.match(/[a-z]/),
        })
        .test({
          name: 'Special characters',
          message:
            'Senha deve conter um caracter especial. Ex.: (!@#$%.&*()_-=+)',
          test: (value) =>
            !!value?.match(/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/),
        }).required(),
      passwordConfirmation: yup.string().required().oneOf([yup.ref('newPassword'), null], 'Senhas não conferem'),
    }).noUnknown();

    await schema.validate({ newPassword, passwordConfirmation });

    const user = await client.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error();
    }

    const passwordHash = await bcrypt.hash(newPassword, 8);
    await client.user.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        updatedAt: getUTCDate(),
        token: null,
      }
    });

    const forgotTokens = await client.forgotPasswordToken.findMany({
      where: {
        userId: user.id,
      }
    });

    await client.tokenBlacklist.createMany({
      data: forgotTokens.map(fT => ({ token: fT.token, createdAt: getUTCDate() })),
    });
    await client.forgotPasswordToken.deleteMany({ where: { userId: user.id } });

    return res.json({
      error: false,
      message: 'Senha alterada com sucesso'
    });
  });

export default router;
