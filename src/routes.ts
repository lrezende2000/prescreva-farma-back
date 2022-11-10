import express from 'express';

import passport from './middlewares/passport';

import LoginController from './controllers/LoginController';
import UserController from './controllers/UserController';
import MedicineController from './controllers/MedicineController';
import PatientController from './controllers/PatientController';
import AppointmentController from './controllers/AppointmentController';
import PrescriptionController from './controllers/PrescriptionController';
import ForwardController from './controllers/ForwardController';
import AvaliationController from './controllers/AvaliationController';

const router = express.Router();

router.use("/public", express.static(process.env.UPLOAD_DIR as string));

router.use(LoginController);
router.use("/medicines", MedicineController);

router.use(passport.authenticate('bearer', { session: false }));

router.use("/user", UserController);
router.use("/patient", PatientController);
router.use("/appointment", AppointmentController);
router.use("/prescription", PrescriptionController);
router.use("/forward", ForwardController);
router.use("/avaliation", AvaliationController);

export default router;