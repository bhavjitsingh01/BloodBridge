import { Router } from 'express';
import { donorController } from '../controllers/donor.controller';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();

router.post('/', authMiddleware, authorize('donor'), donorController.registerDonor);
router.get('/me', authMiddleware, authorize('donor'), donorController.getCurrentDonorProfile);
router.get('/eligible/:bloodGroup', donorController.getEligibleDonorsForBloodGroup);
router.get('/:id', donorController.getDonorProfile);
router.put('/:id', authMiddleware, authorize('donor'), donorController.updateDonorProfile);
router.get('/:id/eligibility', donorController.checkEligibility);
router.put('/:id/availability', authMiddleware, authorize('donor'), donorController.updateAvailabilityStatus);
router.get('/:id/history', donorController.getDonationHistory);

export default router;
