import { IOTP } from '@/interfaces/otp';
import mongoose from 'mongoose';


const OTPSchema = new mongoose.Schema<IOTP>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be 6 digits']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 
  }
});

OTPSchema.index({ email: 1, otp: 1 }, { unique: true });

OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;