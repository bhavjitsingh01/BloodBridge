import { Schema, model, Document, Types } from 'mongoose';

export interface IBloodInventory extends Document {
  hospitalId: Types.ObjectId;
  bloodGroup: string;
  units: number;
  expiryDate: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bloodInventorySchema = new Schema<IBloodInventory>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital ID is required'],
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    },
    units: {
      type: Number,
      required: [true, 'Units are required'],
      min: [0, 'Units cannot be negative'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      validate: {
        validator: (v: Date) => v > new Date(),
        message: 'Expiry date must be in the future',
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
bloodInventorySchema.index({ hospitalId: 1, bloodGroup: 1 });
bloodInventorySchema.index({ expiryDate: 1 });

export default model<IBloodInventory>('BloodInventory', bloodInventorySchema);
