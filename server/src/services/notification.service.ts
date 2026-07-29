import Notification, { INotification } from '../models/Notification';
import User from '../models/User';
import Donor from '../models/Donor';
import Hospital from '../models/Hospital';
import { NotFoundError } from '../utils/errors';
import { NotificationType, NotificationPriority } from '../config/constants';

interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  facilityId?: string;
  bloodGroup?: string;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create a notification
   */
  static async createNotification(input: CreateNotificationInput): Promise<INotification> {
    const user = await User.findById(input.recipientId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const notification = await Notification.create({
      recipient: input.recipientId,
      type: input.type,
      title: input.title,
      message: input.message,
      facility: input.facilityId,
      bloodGroup: input.bloodGroup,
      priority: input.priority,
      actionUrl: input.actionUrl,
      metadata: input.metadata,
      sentAt: new Date(),
    });

    return notification;
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
  }> {
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, read: false }),
    ]);

    return { notifications, total, unreadCount };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<INotification> {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification');
    }
  }

  /**
   * Send blood needed notification
   */
  static async notifyBloodNeeded(
    facilityId: string,
    bloodGroup: string,
    units: number
  ): Promise<void> {
    // Find all donors with matching blood group
    const donors = await Donor.find({ bloodGroup }).populate('user', '_id');

    for (const donor of donors) {
      await this.createNotification({
        recipientId: (donor.user as any)._id.toString(),
        type: 'blood-needed',
        title: 'Blood Donation Needed',
        message: `${units} units of ${bloodGroup} blood are urgently needed`,
        facilityId,
        bloodGroup,
        priority: 'high',
      });
    }
  }

  /**
   * Send emergency notification
   */
  static async notifyEmergency(facilityId: string, bloodGroup: string): Promise<void> {
    const hospital = await Hospital.findById(facilityId);

    if (hospital) {
      const adminUser = await User.findById(hospital.adminUser);
      if (adminUser) {
        await this.createNotification({
          recipientId: adminUser._id.toString(),
          type: 'emergency',
          title: 'Emergency Blood Request',
          message: `Emergency request for ${bloodGroup} blood at ${hospital.name}`,
          facilityId,
          bloodGroup,
          priority: 'critical',
        });
      }
    }
  }

  /**
   * Send low stock notification
   */
  static async notifyLowStock(facilityId: string, bloodGroup: string): Promise<void> {
    const hospital = await Hospital.findById(facilityId);

    if (hospital) {
      const adminUser = await User.findById(hospital.adminUser);
      if (adminUser) {
        await this.createNotification({
          recipientId: adminUser._id.toString(),
          type: 'low-stock',
          title: 'Low Blood Stock Alert',
          message: `${bloodGroup} blood stock is running low at ${hospital.name}`,
          facilityId,
          bloodGroup,
          priority: 'high',
        });
      }
    }
  }

  /**
   * Send appointment reminder
   */
  static async notifyAppointmentReminder(donorId: string, facilityName: string): Promise<void> {
    const donor = await Donor.findById(donorId);

    if (donor) {
      await this.createNotification({
        recipientId: (donor.user as any).toString(),
        type: 'appointment-reminder',
        title: 'Upcoming Donation Appointment',
        message: `You have a donation appointment scheduled at ${facilityName}. Please arrive 15 minutes early.`,
        priority: 'normal',
      });
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ recipient: userId, read: false });
  }
}
