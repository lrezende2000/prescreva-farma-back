import jwt from 'jsonwebtoken';

import { prismaClient } from '../../database/client'
import { deleteRefreshTokenByUserIdService } from './deleteRefreshTokenService';

export const createRefreshTokenService = async (userId: number) => {
  await deleteRefreshTokenByUserIdService(userId);

  const refreshToken = await prismaClient.refreshToken.create({
    data: {
      userId,
    }
  });

  const refreshTokenJwt = jwt.sign({ rfId: refreshToken.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: 60 * 5 });

  return refreshTokenJwt;
}
