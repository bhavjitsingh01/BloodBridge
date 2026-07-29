import { Router } from 'express';
import {
  predictDemand,
  getPredictions,
  detectShortages,
  getExpiryRisks,
  getAIDashboard,
} from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Demand Prediction routes
router.post('/predict-demand', authMiddleware, predictDemand);
router.get('/predictions', authMiddleware, getPredictions);

// Shortage Detection routes
router.get('/shortages', authMiddleware, detectShortages);

// Expiry Risk Detection routes
router.get('/expiry-risk', authMiddleware, getExpiryRisks);

// Comprehensive AI Dashboard
router.get('/dashboard', authMiddleware, getAIDashboard);

export default router;
