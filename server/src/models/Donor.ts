import { Schema, model, Document } from 'mongoose';

export interface IDonor extends Document {
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  city: string;
  state: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  availabilityStatus: 'Available' | 'Unavailable';
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const donorSchema = new Schema<IDonor>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
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
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Donor must be at least 18 years old'],
      max: [65, 'Donor cannot be more than 65 years old'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
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
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Unavailable'],
      default: 'Available',
    },
    lastDonationDate: Date,
    nextEligibleDate: Date,
  },
  { timestamps: true }
);

// Indexes
donorSchema.index({ location: '2dsphere' });
donorSchema.index({ email: 1 });
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ city: 1 });
donorSchema.index({ availabilityStatus: 1 });

export default model<IDonor>('Donor', donorSchema);
