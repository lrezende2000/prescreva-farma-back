import jwt from 'jsonwebtoken';

import { prismaClient } from '../../database/client';

export const updateUserTokenService = async (userId: number) => {
  const token = jwt.sign({}, process.env.SECRET, {
    subject: userId.toString(),
    expiresIn: 2 * 60,
    issuer: 'prescrevafarma.com.br',
    audience: 'prescreve_farma'
  });

  await prismaClient.user.update({
    where: {
      id: userId,
    },
    data: {
      token,
    }
  });

  return token;
}