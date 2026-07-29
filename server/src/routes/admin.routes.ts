import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get('/pending-hospitals', adminController.getPendingHospitals);
router.get('/pending-blood-banks', adminController.getPendingBloodBanks);
router.post('/verify-hospital/:hospitalId', adminController.verifyHospital);
router.post('/verify-blood-bank/:bankId', adminController.verifyBloodBank);
router.delete('/reject-hospital/:hospitalId', adminController.rejectHospital);
router.delete('/reject-blood-bank/:bankId', adminController.rejectBloodBank);
router.get('/analytics', adminController.getSystemAnalytics);

export default router;
