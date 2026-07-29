import { Router } from 'express';
import { bloodInventoryController } from '../controllers/blood-inventory.controller';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();

router.post('/', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodInventoryController.addBlood);
router.get('/expiring', bloodInventoryController.getExpiringBlood);
router.get('/low-stock', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodInventoryController.getLowStockInventory);
router.get('/facility/:facilityId', bloodInventoryController.getFacilityInventory);
router.put('/:id', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodInventoryController.updateInventory);
router.post('/reserve', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodInventoryController.reserveBlood);
router.post('/release', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodInventoryController.releaseBlood);
router.post('/transfer', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodInventoryController.transferBlood);
router.post('/remove-expired', authMiddleware, authorize('admin'), bloodInventoryController.removeExpiredBlood);

export default router;
