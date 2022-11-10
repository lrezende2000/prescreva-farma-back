import passport from 'passport';
import passportHttpBearer from 'passport-http-bearer';
import jwt from 'jsonwebtoken';

import { prismaClient } from '../database/client';

const Strategy = passportHttpBearer.Strategy;

export default passport.use(new Strategy(async (token, done) => {
  try {
    const payload = jwt.verify(token, process.env.SECRET) as jwt.JwtPayload;

    const user = await prismaClient.user.findUnique({
      where: {
        id: parseInt(payload.sub || ''),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      }
    });

    if (!user) throw new Error();

    return done(null, user);
  } catch (err) {
    done(null, false);
  }
}));
