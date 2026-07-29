import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, notificationController.getUserNotifications);
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);
router.post('/:id/mark-read', authMiddleware, notificationController.markAsRead);
router.post('/mark-all-read', authMiddleware, notificationController.markAllAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

export default router;
