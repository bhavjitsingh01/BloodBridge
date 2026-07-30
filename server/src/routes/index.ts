import { Router } from 'express';
import { API_PREFIX } from '../config/constants';
import authRoutes from './auth.routes';
import hospitalRoutes from './hospital.routes';
import bloodBankRoutes from './blood-bank.routes';
import donorRoutes from './donor.routes';
import bloodInventoryRoutes from './blood-inventory.routes';
import emergencyRoutes from './emergency.routes';
import aiRoutes from './ai.routes';
import notificationsRoutes from './notifications.routes';
import recommendationsRoutes from './recommendations.routes';

const router = Router();

// Auth routes
router.use(`${API_PREFIX}/auth`, authRoutes);

// Hospital routes
router.use(`${API_PREFIX}/hospitals`, hospitalRoutes);

// Blood Bank routes
router.use(`${API_PREFIX}/blood-banks`, bloodBankRoutes);

// Donor routes
router.use(`${API_PREFIX}/donors`, donorRoutes);

// Blood Inventory routes
router.use(`${API_PREFIX}/inventory`, bloodInventoryRoutes);

// Emergency routes
router.use(`${API_PREFIX}/emergency`, emergencyRoutes);

// AI routes
router.use(`${API_PREFIX}/ai`, aiRoutes);

// Notification routes
router.use(`${API_PREFIX}/notifications`, notificationsRoutes);

// Recommendation routes
router.use(`${API_PREFIX}/recommendations`, recommendationsRoutes);

// Health check endpoint
router.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'BloodBridge Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
