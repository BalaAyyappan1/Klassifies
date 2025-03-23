import { IHomePageAds } from "@/interfaces/HomePageAds";
import mongoose, { Document, Schema } from 'mongoose';

const HomePageAdsSchema = new Schema<IHomePageAds>(
  {
    images: [{ type: String, required: true }],
    link: { type: String, required: false },
  },
  { timestamps: true } // This adds createdAt and updatedAt automatically
);

const HomePageAds = mongoose.models.homepageads || mongoose.model<IHomePageAds>('homepageads', HomePageAdsSchema);
export default HomePageAds;


