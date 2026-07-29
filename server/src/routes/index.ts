import { Router } from 'express';
import { API_PREFIX } from '../config/constants';
import authRoutes from './auth.routes';
import hospitalRoutes from './hospital.routes';
import bloodBankRoutes from './blood-bank.routes';

const router = Router();

// Auth routes
router.use(`${API_PREFIX}/auth`, authRoutes);

// Hospital routes
router.use(`${API_PREFIX}/hospitals`, hospitalRoutes);

// Blood Bank routes
router.use(`${API_PREFIX}/blood-banks`, bloodBankRoutes);

// Health check endpoint
router.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'BloodBridge Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
