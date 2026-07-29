import { Schema, model, Document, Types } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup, REQUEST_STATUSES, RequestStatus, PRIORITY_LEVELS, PriorityLevel } from '../config/constants';

export interface IBloodRequest extends Document {
  requestingFacility: Types.ObjectId;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsReceived: number;
  priority: PriorityLevel;
  status: RequestStatus;
  requestReason: string;
  patientInfo: {
    age: number;
    bloodGroup: BloodGroup;
    condition: string;
  };
  requiredBy: Date;
  sourceHospital?: Types.ObjectId;
  createdAt: Date;
  fulfilledAt?: Date;
  updatedAt: Date;
}

const bloodRequestSchema = new Schema<IBloodRequest>(
  {
    requestingFacility: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    unitsReceived: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: 'normal',
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'pending',
    },
    requestReason: {
      type: String,
      required: true,
    },
    patientInfo: {
      age: { type: Number, required: true },
      bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
      condition: { type: String, required: true },
    },
    requiredBy: {
      type: Date,
      required: true,
    },
    sourceHospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    fulfilledAt: Date,
  },
  { timestamps: true }
);

// Indexes
bloodRequestSchema.index({ status: 1 });
bloodRequestSchema.index({ requestingFacility: 1 });
bloodRequestSchema.index({ priority: 1 });

export default model<IBloodRequest>('BloodRequest', bloodRequestSchema);
