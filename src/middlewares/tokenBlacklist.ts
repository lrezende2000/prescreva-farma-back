import { Request, Response, NextFunction } from 'express';

import { prismaClient } from '../database/client';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authToken = req.headers.authorization;
    const token = authToken?.split(' ')[1];

    if (!token || token === 'undefined') {
      throw new Error();
    }

    const tokenInBlacklist = await prismaClient.tokenBlacklist.findFirst({
      where: {
        token,
      }
    });

    if (tokenInBlacklist) {
      throw new Error();
    }

    next();
  } catch (err) {
    return res.status(403).json({
      error: true,
      message: 'Sessão ou token expirado',
    });
  }
}
