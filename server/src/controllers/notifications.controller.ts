import { Request, Response } from 'express';
import notificationService from '../services/notification.service';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Get user notifications
export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const limitNum = parseInt(limit as string) || 20;
    const pageNum = parseInt(page as string) || 1;

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = await notificationService.getUserNotifications(req.user.id, limitNum, pageNum);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (error) {
    logger.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const count = await notificationService.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve unread count',
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
      return;
    }

    const notification = await notificationService.markAsRead(id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error: any) {
    if (error.message === 'Notification not found') {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    await notificationService.markAllAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
      return;
    }

    await notificationService.deleteNotification(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
};
