import { Router } from 'express';
import { bloodBankController } from '../controllers/blood-bank.controller';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();

router.get('/', bloodBankController.getAllBloodBanks);
router.post('/', authMiddleware, authorize('blood-bank', 'admin'), bloodBankController.createBloodBank);
router.get('/nearby', bloodBankController.findNearbyBloodBanks);
router.get('/:id', bloodBankController.getBloodBankById);
router.put('/:id', authMiddleware, authorize('blood-bank', 'admin'), bloodBankController.updateBloodBank);
router.get('/:id/expiring', bloodBankController.getExpiringBlood);
router.post('/:id/verify', authMiddleware, authorize('admin'), bloodBankController.verifyBloodBank);
router.delete('/:id', authMiddleware, authorize('admin'), bloodBankController.deleteBloodBank);

export default router;
