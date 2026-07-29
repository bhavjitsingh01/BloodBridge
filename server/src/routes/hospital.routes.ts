import { Router } from 'express';
import { hospitalController } from '../controllers/hospital.controller';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();

router.get('/', hospitalController.getAllHospitals);
router.post('/', authMiddleware, authorize('hospital', 'admin'), hospitalController.createHospital);
router.get('/nearby', hospitalController.findNearbyHospitals);
router.get('/:id', hospitalController.getHospitalById);
router.put('/:id', authMiddleware, authorize('hospital', 'admin'), hospitalController.updateHospital);
router.get('/:id/inventory', hospitalController.getHospitalInventory);
router.post('/:id/verify', authMiddleware, authorize('admin'), hospitalController.verifyHospital);
router.delete('/:id', authMiddleware, authorize('admin'), hospitalController.deleteHospital);

export default router;
