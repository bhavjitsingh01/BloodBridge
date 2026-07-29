import { Schema, model, Document, Types } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup, APPOINTMENT_STATUSES, AppointmentStatus } from '../config/constants';

export interface IDonationAppointment extends Document {
  donor: Types.ObjectId;
  facility: Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  status: AppointmentStatus;
  bloodGroup: BloodGroup;
  unitsToCollect: number;
  healthCheckCompleted: boolean;
  donationCompleted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const donationAppointmentSchema = new Schema<IDonationAppointment>(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'scheduled',
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    unitsToCollect: {
      type: Number,
      default: 1,
    },
    healthCheckCompleted: {
      type: Boolean,
      default: false,
    },
    donationCompleted: {
      type: Boolean,
      default: false,
    },
    notes: String,
  },
  { timestamps: true }
);

// Indexes
donationAppointmentSchema.index({ donor: 1 });
donationAppointmentSchema.index({ facility: 1 });
donationAppointmentSchema.index({ appointmentDate: 1 });
donationAppointmentSchema.index({ status: 1 });

export default model<IDonationAppointment>('DonationAppointment', donationAppointmentSchema);
