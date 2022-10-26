import express from 'express';
import rateLimit from 'express-rate-limit';

import passport from './middlewares/passport';

import LoginController from './controllers/LoginController';
import MedicineController from './controllers/MedicineController';

const router = express.Router();

router.use(LoginController);
router.use("/medicines", MedicineController);

router.use(passport.authenticate('bearer', { session: false }));

export default router;