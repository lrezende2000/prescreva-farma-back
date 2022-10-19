import jwt from 'jsonwebtoken';

import { prismaClient } from '../../database/client';

export const updateUserTokenService = async (userId: number) => {
  const token = jwt.sign({}, process.env.SECRET, {
    subject: userId.toString(),
    expiresIn: 1000 * 60 * 10,
    issuer: 'http://localhost',
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