import { Router } from 'express';
import { emergencyController } from '../controllers/emergency.controller';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();

router.post('/', authMiddleware, authorize('hospital'), emergencyController.createEmergencyRequest);
router.get('/', emergencyController.getActiveEmergencies);
router.get('/:id', emergencyController.getEmergencyRequest);
router.post('/:id/resolve', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), emergencyController.resolveEmergency);

export default router;
