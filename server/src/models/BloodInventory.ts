import { Schema, model, Document, Types } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup } from '../config/constants';

export interface IBloodInventory extends Document {
  facility: Types.ObjectId;
  bloodGroup: BloodGroup;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  units: Array<{
    batchNumber: string;
    collectionDate: Date;
    expiryDate: Date;
    quantity: number;
    status: 'available' | 'reserved' | 'transferred' | 'expired';
  }>;
  lastUpdated: Date;
  criticalLevel: number;
  lowLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const bloodInventorySchema = new Schema<IBloodInventory>(
  {
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    totalUnits: {
      type: Number,
      default: 0,
    },
    availableUnits: {
      type: Number,
      default: 0,
    },
    reservedUnits: {
      type: Number,
      default: 0,
    },
    units: [
      {
        batchNumber: { type: String, required: true },
        collectionDate: { type: Date, required: true },
        expiryDate: { type: Date, required: true },
        quantity: { type: Number, required: true },
        status: {
          type: String,
          enum: ['available', 'reserved', 'transferred', 'expired'],
          default: 'available',
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    criticalLevel: {
      type: Number,
      default: 10,
    },
    lowLevel: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
);

// Indexes
bloodInventorySchema.index({ facility: 1, bloodGroup: 1 });
bloodInventorySchema.index({ 'units.expiryDate': 1 });

export default model<IBloodInventory>('BloodInventory', bloodInventorySchema);
