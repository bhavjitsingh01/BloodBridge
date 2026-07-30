import { Schema, model, Document } from 'mongoose';

export interface IHospital extends Document {
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
  role: 'hospital';
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
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
    role: {
      type: String,
      default: 'hospital',
      enum: ['hospital'],
    },
  },
  { timestamps: true }
);

// Indexes
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ email: 1 });
hospitalSchema.index({ city: 1 });

export default model<IHospital>('Hospital', hospitalSchema);
