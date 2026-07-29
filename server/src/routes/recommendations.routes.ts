import { Router } from 'express';
import {
  getTransferRecommendations,
  getDonorRecommendations,
} from '../controllers/recommendations.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes
router.get('/transfers', authMiddleware, getTransferRecommendations);
router.get('/donors', authMiddleware, getDonorRecommendations);

export default router;
