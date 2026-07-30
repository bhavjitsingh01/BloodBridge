import { Router } from 'express';
import {
  createEmergencyRequest,
  getEmergencyRequests,
  getEmergencyRequestById,
  updateEmergencyStatus,
  deleteEmergencyRequest,
  executeEmergencyMatching,
} from '../controllers/emergency.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getEmergencyRequests);
router.get('/:id', getEmergencyRequestById);

// Protected routes
router.post('/', authMiddleware, createEmergencyRequest);
router.patch('/:id/status', authMiddleware, updateEmergencyStatus);
router.delete('/:id', authMiddleware, deleteEmergencyRequest);

// Matching endpoint
router.post('/matching/:requestId', authMiddleware, executeEmergencyMatching);

export default router;
