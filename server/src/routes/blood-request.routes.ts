import { Router } from 'express';
import { bloodRequestController } from '../controllers/blood-request.controller';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();

router.post('/', authMiddleware, authorize('hospital'), bloodRequestController.createRequest);
router.get('/', bloodRequestController.getPendingRequests);
router.get('/:id', bloodRequestController.getRequestById);
router.get('/facility/:facilityId', bloodRequestController.getFacilityRequests);
router.put('/:id', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodRequestController.updateRequest);
router.post('/:id/fulfill', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodRequestController.fulfillRequest);
router.post('/:id/reject', authMiddleware, authorize('hospital', 'blood-bank', 'admin'), bloodRequestController.rejectRequest);
router.get('/blood/:bloodGroup', bloodRequestController.findRequestsForBlood);

export default router;
