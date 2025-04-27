import { IUser } from '@/interfaces/user';
import mongoose, { Document, Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "First name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String, 
      minlength: 8,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "employee"],
      default: "user",
    },
    profile: {
      type: String,
      default: "",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    location: {
      type: { type: String, enum: ['Point'], required: false },
      coordinates: { type: [Number], required: false }
    },
    ipAddress: { 
      type: String, 
      required: true, 
    },
  },
 
  
  {
    timestamps: true,
  }
);

const User = mongoose.models.user || mongoose.model<IUser>('user', userSchema);

export default User;
