import { Router } from 'express';
import { API_PREFIX } from '../config/constants';
import authRoutes from './auth.routes';
import hospitalRoutes from './hospital.routes';
import bloodBankRoutes from './blood-bank.routes';
import donorRoutes from './donor.routes';
import bloodInventoryRoutes from './blood-inventory.routes';

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

// Health check endpoint
router.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'BloodBridge Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
