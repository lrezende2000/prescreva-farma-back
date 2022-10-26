import { Request, Response, NextFunction } from 'express';

import allowedOrigins from '../config/allowedOrigins';

export default (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
    req.origin = origin;
  } else {
    res.removeHeader('Access-Control-Allow-Credentials');
  }

  next();
}
