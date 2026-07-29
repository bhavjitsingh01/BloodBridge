import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess, sendCreated } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../config/constants';

export const notificationController = {
  /**
   * Get user notifications
   */
  getUserNotifications: asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const result = await NotificationService.getUserNotifications(
      req.user!.id,
      skip,
      parseInt(limit as string)
    );

    sendSuccess(res, result, 'Notifications retrieved successfully');
  }),

  /**
   * Mark notification as read
   */
  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id);
    sendSuccess(res, notification, 'Notification marked as read');
  }),

  /**
   * Mark all as read
   */
  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    await NotificationService.markAllAsRead(req.user!.id);
    sendSuccess(res, null, 'All notifications marked as read');
  }),

  /**
   * Delete notification
   */
  deleteNotification: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await NotificationService.deleteNotification(id);
    sendSuccess(res, null, 'Notification deleted successfully');
  }),

  /**
   * Get unread count
   */
  getUnreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await NotificationService.getUnreadCount(req.user!.id);
    sendSuccess(res, { unreadCount: count }, 'Unread count retrieved successfully');
  }),
};
