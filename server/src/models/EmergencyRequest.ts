import { Schema, model, Document, Types } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup, EMERGENCY_STATUSES, EmergencyStatus, EMERGENCY_PRIORITY, EmergencyPriority } from '../config/constants';

export interface IEmergencyRequest extends Document {
  hospital: Types.ObjectId;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  priority: EmergencyPriority;
  patientInfo: {
    age: number;
    bloodGroup: BloodGroup;
    condition: string;
    reason: string;
  };
  status: EmergencyStatus;
  sources: {
    hospitals: Types.ObjectId[];
    bloodBanks: Types.ObjectId[];
    eligibleDonors: Types.ObjectId[];
  };
  estimates: {
    fastestSource: {
      facility: Types.ObjectId;
      eta: number;
      distance: number;
    };
    recommendedRoute: {
      from: Types.ObjectId;
      to: Types.ObjectId;
      distance: number;
      eta: number;
    };
  };
  createdAt: Date;
  resolvedAt?: Date;
  updatedAt: Date;
}

const emergencyRequestSchema = new Schema<IEmergencyRequest>(
  {
    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    unitsNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    priority: {
      type: String,
      enum: EMERGENCY_PRIORITY,
      default: 'high',
    },
    patientInfo: {
      age: { type: Number, required: true },
      bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
      condition: { type: String, required: true },
      reason: { type: String, required: true },
    },
    status: {
      type: String,
      enum: EMERGENCY_STATUSES,
      default: 'active',
    },
    sources: {
      hospitals: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
      bloodBanks: [{ type: Schema.Types.ObjectId, ref: 'BloodBank' }],
      eligibleDonors: [{ type: Schema.Types.ObjectId, ref: 'Donor' }],
    },
    estimates: {
      fastestSource: {
        facility: { type: Schema.Types.ObjectId, ref: 'Hospital' },
        eta: Number,
        distance: Number,
      },
      recommendedRoute: {
        from: { type: Schema.Types.ObjectId, ref: 'Hospital' },
        to: { type: Schema.Types.ObjectId, ref: 'Hospital' },
        distance: Number,
        eta: Number,
      },
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

// Indexes
emergencyRequestSchema.index({ status: 1 });
emergencyRequestSchema.index({ priority: 1 });
emergencyRequestSchema.index({ createdAt: -1 });

export default model<IEmergencyRequest>('EmergencyRequest', emergencyRequestSchema);
