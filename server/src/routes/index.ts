import { Router } from 'express';
import { API_PREFIX } from '../config/constants';

const router = Router();

// Health check endpoint
router.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'BloodBridge Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
