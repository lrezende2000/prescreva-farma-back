import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';

import passport from './middlewares/passport';

import LoginController from './controllers/LoginController';
import MedicineController from './controllers/MedicineController';
import PatientController from './controllers/PatientController';
import AppointmentController from './controllers/AppointmentController';
import PrescriptionController from './controllers/PrescriptionController';
import ForwardController from './controllers/ForwardController';

const router = express.Router();

router.use("/public", express.static(process.env.UPLOAD_DIR as string));

router.use(LoginController);
router.use("/medicines", MedicineController);

router.use(passport.authenticate('bearer', { session: false }));

router.use("/patient", PatientController);
router.use("/appointment", AppointmentController);
router.use("/prescription", PrescriptionController);
router.use("/forward", ForwardController);

export default router;