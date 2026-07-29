import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  role: 'Donor' | 'Hospital' | 'BloodBank' | 'Admin';
  email: string;
  password: string;
  name?: string;
  fullName?: string;
  hospitalName?: string;
  bloodBankName?: string;
  phone?: string;
  bloodGroup?: string;
  city?: string;
  state?: string;
  address?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['Donor', 'Hospital', 'BloodBank', 'Admin'],
        message: 'Role must be one of: Donor, Hospital, BloodBank, Admin',
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    name: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    hospitalName: {
      type: String,
      trim: true,
    },
    bloodBankName: {
      type: String,
      trim: true,
    },
    phone: String,
    bloodGroup: {
      type: String,
      enum: {
        values: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
        message: 'Invalid blood group',
      },
    },
    city: String,
    state: String,
    address: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default model<IUser>('User', userSchema);
