import { Router } from 'express';
import { API_PREFIX } from '../config/constants';

import authRoutes from './auth.routes';
import hospitalRoutes from './hospital.routes';
import bloodBankRoutes from './blood-bank.routes';
import donorRoutes from './donor.routes';
import bloodInventoryRoutes from './blood-inventory.routes';
import bloodRequestRoutes from './blood-request.routes';
import emergencyRoutes from './emergency.routes';
import appointmentRoutes from './appointment.routes';
import predictionRoutes from './prediction.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Auth routes
router.use(`${API_PREFIX}/auth`, authRoutes);

// Hospital routes
router.use(`${API_PREFIX}/hospitals`, hospitalRoutes);

// Blood bank routes
router.use(`${API_PREFIX}/blood-banks`, bloodBankRoutes);

// Donor routes
router.use(`${API_PREFIX}/donors`, donorRoutes);

// Blood inventory routes
router.use(`${API_PREFIX}/blood-inventory`, bloodInventoryRoutes);

// Blood request routes
router.use(`${API_PREFIX}/blood-requests`, bloodRequestRoutes);

// Emergency routes
router.use(`${API_PREFIX}/emergency-requests`, emergencyRoutes);

// Appointment routes
router.use(`${API_PREFIX}/appointments`, appointmentRoutes);

// Prediction routes
router.use(`${API_PREFIX}/predictions`, predictionRoutes);

// Notification routes
router.use(`${API_PREFIX}/notifications`, notificationRoutes);

// Analytics routes
router.use(`${API_PREFIX}/analytics`, analyticsRoutes);

// Admin routes
router.use(`${API_PREFIX}/admin`, adminRoutes);

// Health check endpoint
router.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
