import { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req;

    if (!user?.isAdmin) {
      throw new Error();
    }

    next();
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: 'Você não tem acesso a este recurso',
    });
  }
}
