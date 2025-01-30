import { IAds } from '@/interfaces/ad';
import mongoose, { Document, Schema } from 'mongoose';


const AdsSchema = new Schema<IAds>({
    userId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    mainCategory: { type: Object, required: true },
    subCategory: { type: Object, required: true },
    subCategory2: { type: Object, required: true },
  
    images: { type: String, required: false },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
  
    location: {
      type: { type: String, enum: ['Point'], required: false },
      coordinates: { type: [Number], required: false }
    },
  
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'blocked', 'delete'],
      default: 'pending'
    },

    showAllStates: { type: Boolean, default: false },
  
    createdAd: { type: Date, default: Date.now },
    updatedAd: { type: Date, default: Date.now }
  });
  

const Ad = mongoose.models.Ad || mongoose.model<IAds>('Ad', AdsSchema);

export default Ad;
