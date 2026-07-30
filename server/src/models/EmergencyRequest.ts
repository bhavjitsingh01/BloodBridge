import { Schema, model, Document, Types } from 'mongoose';

export interface IEmergencyRequest extends Document {
  requesterId: Types.ObjectId;
  requesterType: 'Hospital' | 'BloodBank';
  bloodGroup: string;
  unitsRequired: number;
  priority: 'Normal' | 'High' | 'Critical';
  requiredBefore: Date;
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
      enum: {
        values: ['Hospital', 'BloodBank'],
        message: 'Requester type must be Hospital or BloodBank',
      },
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: {
        values: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
        message: 'Invalid blood group',
      },
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is required'],
      min: [1, 'At least 1 unit is required'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['Normal', 'High', 'Critical'],
        message: 'Priority must be Normal, High, or Critical',
      },
      default: 'Normal',
    },
    requiredBefore: {
      type: Date,
      required: [true, 'Required before date is required'],
      validate: {
        validator: (v: Date) => v > new Date(),
        message: 'Required before date must be in the future',
      },
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Pending', 'Accepted', 'Completed', 'Cancelled'],
        message: 'Status must be Pending, Accepted, Completed, or Cancelled',
      },
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
emergencyRequestSchema.index({ status: 1 });
emergencyRequestSchema.index({ priority: 1 });
emergencyRequestSchema.index({ requesterId: 1 });
emergencyRequestSchema.index({ createdAt: -1 });
emergencyRequestSchema.index({ requiredBefore: 1 });
emergencyRequestSchema.index({ bloodGroup: 1, status: 1 });

export default model<IEmergencyRequest>('EmergencyRequest', emergencyRequestSchema);
