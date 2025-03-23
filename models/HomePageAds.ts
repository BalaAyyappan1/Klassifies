import { IHomePageAds } from "@/interfaces/HomePageAds";
import mongoose, { Document, Schema } from 'mongoose';

const HomePageAdsSchema = new Schema<IHomePageAds>({
    images: [{ type: String, required: true }],
  createdAd: { type: Date, required: true, default: Date.now }
});

const HomePageAds = mongoose.models.homepageads || mongoose.model<IHomePageAds>('homepageads', HomePageAdsSchema);
export default HomePageAds;


