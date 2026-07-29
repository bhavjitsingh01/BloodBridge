import { Schema, model, Document, Types } from 'mongoose';

export interface IEmergencyRequest extends Document {
  requesterId: Types.ObjectId;
  requesterType: 'Hospital' | 'BloodBank';
  bloodGroup: string;
  unitsRequired: number;
  priority: 'Normal' | 'High' | 'Critical';
  status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const emergencyRequestSchema = new Schema<IEmergencyRequest>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Requester ID is required'],
      refPath: 'requesterType',
    },
    requesterType: {
      type: String,
      required: [true, 'Requester type is required'],
      enum: ['Hospital', 'BloodBank'],
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is required'],
      min: [1, 'At least 1 unit is required'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['Normal', 'High', 'Critical'],
      default: 'Normal',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Pending', 'Accepted', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Indexes
emergencyRequestSchema.index({ status: 1 });
emergencyRequestSchema.index({ priority: 1 });
emergencyRequestSchema.index({ requesterId: 1 });
emergencyRequestSchema.index({ createdAt: -1 });

export default model<IEmergencyRequest>('EmergencyRequest', emergencyRequestSchema);
