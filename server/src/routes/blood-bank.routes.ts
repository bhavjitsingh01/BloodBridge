import { Router } from 'express';
import {
  createBloodBank,
  getBloodBanks,
  getBloodBankById,
  updateBloodBank,
  deleteBloodBank,
} from '../controllers/blood-bank.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getBloodBanks);
router.get('/:id', getBloodBankById);

// Protected routes
router.post('/', authMiddleware, createBloodBank);
router.put('/:id', authMiddleware, updateBloodBank);
router.delete('/:id', authMiddleware, deleteBloodBank);

export default router;
