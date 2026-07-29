import { Router } from 'express';
import {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
} from '../controllers/hospital.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getHospitals);
router.get('/:id', getHospitalById);

// Protected routes
router.post('/', authMiddleware, createHospital);
router.put('/:id', authMiddleware, updateHospital);
router.delete('/:id', authMiddleware, deleteHospital);

export default router;
