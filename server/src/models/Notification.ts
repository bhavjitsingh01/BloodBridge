import { Schema, model, Document, Types } from 'mongoose';
import { NOTIFICATION_TYPES, NotificationType, NOTIFICATION_PRIORITY, NotificationPriority } from '../config/constants';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  facility?: Types.ObjectId;
  bloodGroup?: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  sentAt: Date;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    bloodGroup: String,
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITY,
      default: 'normal',
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
    metadata: Schema.Types.Mixed,
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: Date,
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export default model<INotification>('Notification', notificationSchema);
