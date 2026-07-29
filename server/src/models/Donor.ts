import { Schema, model, Document, Types } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup, ELIGIBILITY_STATUSES, EligibilityStatus, AVAILABILITY_STATUSES, AvailabilityStatus } from '../config/constants';

export interface IDonor extends Document {
  user: Types.ObjectId;
  bloodGroup: BloodGroup;
  lastDonationDate?: Date;
  eligibilityStatus: EligibilityStatus;
  availabilityStatus: AvailabilityStatus;
  donationHistory: Array<{
    date: Date;
    location: Types.ObjectId;
    unitsCollected: number;
    healthStatus: string;
  }>;
  medicalHistory: {
    hasChronicDisease: boolean;
    diseaseDetails?: string;
    lastMedicalCheckup?: Date;
    bloodPressure?: string;
    hemoglobin: number;
  };
  eligibilityCheckDate?: Date;
  preferredDonationCenters: Types.ObjectId[];
  notifications: Types.ObjectId[];
  totalDonations: number;
  createdAt: Date;
  updatedAt: Date;
}

const donorSchema = new Schema<IDonor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    lastDonationDate: Date,
    eligibilityStatus: {
      type: String,
      enum: ELIGIBILITY_STATUSES,
      default: 'pending',
    },
    availabilityStatus: {
      type: String,
      enum: AVAILABILITY_STATUSES,
      default: 'available',
    },
    donationHistory: [
      {
        date: { type: Date, default: Date.now },
        location: { type: Schema.Types.ObjectId, ref: 'Hospital' },
        unitsCollected: Number,
        healthStatus: String,
      },
    ],
    medicalHistory: {
      hasChronicDisease: { type: Boolean, default: false },
      diseaseDetails: String,
      lastMedicalCheckup: Date,
      bloodPressure: String,
      hemoglobin: { type: Number, default: 0 },
    },
    eligibilityCheckDate: Date,
    preferredDonationCenters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
    totalDonations: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
donorSchema.index({ user: 1 });
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ eligibilityStatus: 1 });

export default model<IDonor>('Donor', donorSchema);
