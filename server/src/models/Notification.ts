import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'emergency_donor_request' | 'expiry_alert' | 'transfer_recommendation' | 'general';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  isRead: boolean;
  metadata?: {
    emergencyRequestId?: Types.ObjectId;
    bloodGroup?: string;
    unitsNeeded?: number;
    hospitalId?: Types.ObjectId;
    donorId?: Types.ObjectId;
    expiryDate?: Date;
    transferDetails?: {
      fromLocationId: Types.ObjectId;
      toLocationId: Types.ObjectId;
      bloodGroup: string;
      units: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: ['emergency_donor_request', 'expiry_alert', 'transfer_recommendation', 'general'],
        message: 'Invalid notification type',
      },
      default: 'general',
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: 'Invalid priority level',
      },
      default: 'Medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      emergencyRequestId: Schema.Types.ObjectId,
      bloodGroup: String,
      unitsNeeded: Number,
      hospitalId: Schema.Types.ObjectId,
      donorId: Schema.Types.ObjectId,
      expiryDate: Date,
      transferDetails: {
        fromLocationId: Schema.Types.ObjectId,
        toLocationId: Schema.Types.ObjectId,
        bloodGroup: String,
        units: Number,
      },
    },
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });

export default model<INotification>('Notification', notificationSchema);
