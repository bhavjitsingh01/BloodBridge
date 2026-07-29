import { Schema, model, Document } from 'mongoose';

export interface IBloodBank extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}

const bloodBankSchema = new Schema<IBloodBank>(
  {
    name: {
      type: String,
      required: [true, 'Blood bank name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: 'Coordinates must contain [longitude, latitude]',
        },
      },
    },
  },
  { timestamps: true }
);

// Indexes
bloodBankSchema.index({ location: '2dsphere' });
bloodBankSchema.index({ email: 1 });
bloodBankSchema.index({ city: 1 });

export default model<IBloodBank>('BloodBank', bloodBankSchema);
