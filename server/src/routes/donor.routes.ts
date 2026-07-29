import { Router } from 'express';
import {
  createDonor,
  getDonors,
  getDonorById,
  updateDonor,
  updateDonorAvailability,
  deleteDonor,
} from '../controllers/donor.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getDonors);
router.get('/:id', getDonorById);

// Protected routes
router.post('/', authMiddleware, createDonor);
router.put('/:id', authMiddleware, updateDonor);
router.patch('/:id/availability', authMiddleware, updateDonorAvailability);
router.delete('/:id', authMiddleware, deleteDonor);

export default router;
