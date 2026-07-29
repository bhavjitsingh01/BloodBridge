import { Router } from 'express';
import { API_PREFIX } from '../config/constants';
import authRoutes from './auth.routes';

const router = Router();

// Auth routes
router.use(`${API_PREFIX}/auth`, authRoutes);

// Health check endpoint
router.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'BloodBridge Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
