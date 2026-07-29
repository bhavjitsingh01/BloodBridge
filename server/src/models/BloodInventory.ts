import { Schema, model, Document, Types } from 'mongoose';

export interface IBloodInventory extends Document {
  hospitalId: Types.ObjectId;
  bloodGroup: string;
  units: number;
  collectionDate: Date;
  expiryDate: Date;
  status: 'Available' | 'Reserved' | 'Expired';
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
      enum: {
        values: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
        message: 'Invalid blood group',
      },
    },
    units: {
      type: Number,
      required: [true, 'Units are required'],
      min: [0, 'Units cannot be negative'],
    },
    collectionDate: {
      type: Date,
      required: [true, 'Collection date is required'],
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Available', 'Reserved', 'Expired'],
        message: 'Status must be Available, Reserved, or Expired',
      },
      default: 'Available',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to check if blood is expired
bloodInventorySchema.pre('save', function (next) {
  if (this.expiryDate < new Date()) {
    this.status = 'Expired';
  }
  this.lastUpdated = new Date();
  next();
});

// Indexes for efficient queries
bloodInventorySchema.index({ hospitalId: 1, bloodGroup: 1 });
bloodInventorySchema.index({ expiryDate: 1 });
bloodInventorySchema.index({ bloodGroup: 1 });
bloodInventorySchema.index({ status: 1 });
bloodInventorySchema.index({ createdAt: -1 });

export default model<IBloodInventory>('BloodInventory', bloodInventorySchema);
