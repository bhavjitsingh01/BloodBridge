import { Router } from 'express';
import {
  createInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getExpiringInventory,
  getInventorySummary,
} from '../controllers/blood-inventory.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getInventory);
router.get('/expiring', getExpiringInventory);
router.get('/summary', getInventorySummary);
router.get('/:id', getInventoryById);

// Protected routes
router.post('/', authMiddleware, createInventory);
router.put('/:id', authMiddleware, updateInventory);
router.delete('/:id', authMiddleware, deleteInventory);

export default router;
