import mongoose, { Schema } from 'mongoose';

export interface IHomePageVideo {
  video: string;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const HomePageVideoSchema = new Schema<IHomePageVideo>(
  {
    video: { type: String, required: true },
    link: { type: String, required: false },
  },
  { timestamps: true }
);

const HomePageVideo = mongoose.models.homepagevideo || mongoose.model<IHomePageVideo>('homepagevideo', HomePageVideoSchema);
export default HomePageVideo;