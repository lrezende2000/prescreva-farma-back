import express from 'express';
import rateLimit from 'express-rate-limit';

import passport from './middlewares/passport';

import LoginController from './controllers/LoginController';
import MedicineController from './controllers/MedicineController';
import PatientController from './controllers/PatientController';
import AppointmentController from './controllers/AppointmentController';
import PrescriptionController from './controllers/PrescriptionController';

const router = express.Router();

router.use(LoginController);
router.use("/medicines", MedicineController);

router.use(passport.authenticate('bearer', { session: false }));

router.use("/patient", PatientController);
router.use("/appointment", AppointmentController);
router.use("/prescription", PrescriptionController);

export default router;