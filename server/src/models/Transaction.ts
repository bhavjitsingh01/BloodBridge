import { Schema, model, Document, Types } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup, TRANSACTION_TYPES, TransactionType, TRANSACTION_STATUSES, TransactionStatus } from '../config/constants';

export interface ITransaction extends Document {
  type: TransactionType;
  fromFacility: Types.ObjectId;
  toFacility: Types.ObjectId;
  bloodGroup: BloodGroup;
  units: number;
  batchNumbers: string[];
  status: TransactionStatus;
  distance: number;
  estimatedTime: number;
  actualTime?: number;
  reason: string;
  requestedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },
    fromFacility: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    toFacility: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    batchNumbers: [String],
    status: {
      type: String,
      enum: TRANSACTION_STATUSES,
      default: 'requested',
    },
    distance: {
      type: Number,
      default: 0,
    },
    estimatedTime: {
      type: Number,
      default: 0,
    },
    actualTime: Number,
    reason: {
      type: String,
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: Date,
  },
  { timestamps: true }
);

// Indexes
transactionSchema.index({ status: 1 });
transactionSchema.index({ fromFacility: 1 });
transactionSchema.index({ toFacility: 1 });

export default model<ITransaction>('Transaction', transactionSchema);
