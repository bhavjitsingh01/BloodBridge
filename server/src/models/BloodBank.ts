import { Schema, model, Document, Types } from 'mongoose';

export interface IBloodBank extends Document {
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  registrationNumber: string;
  adminUser: Types.ObjectId;
  verified: boolean;
  verifiedAt?: Date;
  bloodInventory: Types.ObjectId[];
  collectionCount: number;
  distributionCount: number;
  operatingHours: {
    open: string;
    close: string;
    daysOpen: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const bloodBankSchema = new Schema<IBloodBank>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    adminUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    bloodInventory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'BloodInventory',
      },
    ],
    collectionCount: {
      type: Number,
      default: 0,
    },
    distributionCount: {
      type: Number,
      default: 0,
    },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
      daysOpen: { type: [Number], default: [0, 1, 2, 3, 4, 5] },
    },
  },
  { timestamps: true }
);

// Indexes
bloodBankSchema.index({ 'address.coordinates': '2dsphere' });
bloodBankSchema.index({ verified: 1 });
bloodBankSchema.index({ email: 1 });

export default model<IBloodBank>('BloodBank', bloodBankSchema);
