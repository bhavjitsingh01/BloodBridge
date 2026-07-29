import Notification from '../models/Notification';
import Donor from '../models/Donor';
import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import User from '../models/User';
import logger from '../utils/logger';
import { Types } from 'mongoose';

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'emergency_donor_request' | 'expiry_alert' | 'transfer_recommendation' | 'general';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  metadata?: any;
}

interface NotificationResponse {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

export class NotificationService {
  async createNotification(payload: NotificationPayload): Promise<NotificationResponse> {
    try {
      const notification = new Notification({
        userId: new Types.ObjectId(payload.userId),
        title: payload.title,
        message: payload.message,
        type: payload.type,
        priority: payload.priority,
        metadata: payload.metadata || {},
      });

      await notification.save();
      logger.info(`Notification created for user ${payload.userId}: ${payload.type}`);

      return this.formatNotification(notification);
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  async notifyDonorsForEmergency(
    emergencyRequestId: string,
    bloodGroup: string,
    unitsRequired: number,
    requesterLocation: [number, number],
    priority: string
  ): Promise<void> {
    try {
      logger.info(`Notifying donors for emergency request: ${bloodGroup}, ${unitsRequired} units`);

      const now = new Date();

      // Find eligible donors
      const donors = await Donor.find({
        bloodGroup,
        availabilityStatus: 'Available',
        nextEligibleDate: { $lte: now },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: requesterLocation,
            },
            $maxDistance: 50000, // 50km
          },
        },
      });

      logger.info(`Found ${donors.length} eligible donors`);

      // Create notifications for each donor
      for (const donor of donors) {
        const donorUser = await User.findOne({ email: donor.email });

        if (donorUser) {
          await this.createNotification({
            userId: donorUser._id.toString(),
            title: `Emergency Blood Donation Request - ${bloodGroup}`,
            message: `An emergency blood request for ${bloodGroup} blood type has been issued. ${unitsRequired} units are urgently needed. Your donation could save lives.`,
            type: 'emergency_donor_request',
            priority: priority as any,
            metadata: {
              emergencyRequestId: new Types.ObjectId(emergencyRequestId),
              bloodGroup,
              unitsNeeded: unitsRequired,
              donorId: donor._id,
            },
          });
        }
      }

      logger.info(`Notifications sent to ${donors.length} donors`);
    } catch (error) {
      logger.error('Notify donors for emergency error:', error);
      throw error;
    }
  }

  async notifyHospitalExpiryAlert(
    hospitalId: string,
    bloodGroup: string,
    units: number,
    expiryDate: Date,
    daysUntilExpiry: number
  ): Promise<void> {
    try {
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) return;

      // Find hospital admin/manager
      const hospitalUser = await User.findOne({ email: hospital.email });

      if (hospitalUser) {
        const priority = daysUntilExpiry <= 3 ? 'Critical' : 'High';

        await this.createNotification({
          userId: hospitalUser._id.toString(),
          title: `Blood Expiry Alert - ${bloodGroup}`,
          message: `${units} units of ${bloodGroup} blood will expire in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()}). Please prioritize usage or arrange transfer.`,
          type: 'expiry_alert',
          priority,
          metadata: {
            hospitalId: new Types.ObjectId(hospitalId),
            bloodGroup,
            units,
            expiryDate,
            daysUntilExpiry,
          },
        });

        logger.info(`Expiry alert sent to hospital ${hospital.name}`);
      }
    } catch (error) {
      logger.error('Notify hospital expiry alert error:', error);
      throw error;
    }
  }

  async notifyTransferRecommendation(
    toLocationId: string,
    fromLocationId: string,
    fromLocationType: 'Hospital' | 'BloodBank',
    bloodGroup: string,
    units: number,
    reason: string
  ): Promise<void> {
    try {
      let toLocation = await Hospital.findById(toLocationId);
      if (!toLocation) {
        toLocation = await BloodBank.findById(toLocationId);
      }

      if (!toLocation) return;

      const toUser = await User.findOne({ email: toLocation.email });

      if (toUser) {
        await this.createNotification({
          userId: toUser._id.toString(),
          title: `Blood Transfer Recommendation - ${bloodGroup}`,
          message: `We recommend receiving ${units} units of ${bloodGroup} blood from nearby facility. ${reason}`,
          type: 'transfer_recommendation',
          priority: 'High',
          metadata: {
            transferDetails: {
              fromLocationId: new Types.ObjectId(fromLocationId),
              toLocationId: new Types.ObjectId(toLocationId),
              bloodGroup,
              units,
            },
          },
        });

        logger.info(`Transfer recommendation sent to location ${toLocation.name}`);
      }
    } catch (error) {
      logger.error('Notify transfer recommendation error:', error);
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    limit: number = 20,
    page: number = 1
  ): Promise<{ notifications: NotificationResponse[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        Notification.find({ userId: new Types.ObjectId(userId) })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip)
          .lean(),
        Notification.countDocuments({ userId: new Types.ObjectId(userId) }),
      ]);

      return {
        notifications: notifications.map((n: any) => this.formatNotification(n)),
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Get user notifications error:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      logger.info(`Notification marked as read: ${notificationId}`);
      return this.formatNotification(notification);
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await Notification.findByIdAndDelete(notificationId);
      logger.info(`Notification deleted: ${notificationId}`);
    } catch (error) {
      logger.error('Delete notification error:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await Notification.countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false,
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        { userId: new Types.ObjectId(userId), isRead: false },
        { isRead: true }
      );

      logger.info(`All notifications marked as read for user ${userId}`);
    } catch (error) {
      logger.error('Mark all as read error:', error);
      throw error;
    }
  }

  private formatNotification(notification: any): NotificationResponse {
    return {
      _id: notification._id.toString(),
      userId: notification.userId.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      metadata: notification.metadata,
    };
  }
}

export default new NotificationService();
