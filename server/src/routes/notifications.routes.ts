import { Router } from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notifications.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes
router.get('/', authMiddleware, getUserNotifications);
router.get('/unread/count', authMiddleware, getUnreadCount);
router.patch('/:id/read', authMiddleware, markAsRead);
router.patch('/read/all', authMiddleware, markAllAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
