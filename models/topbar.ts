import { ITopBar } from '@/interfaces/topbar';
import mongoose, { Document, Schema } from 'mongoose';

const topBarSchema = new Schema<ITopBar>(
  {
    adName: { type: String, required: true },
    textColor: { type: String, default: "#000" }, 
    bgColor: { type: String, default: "#fff" }, 
    fontSize: { type: String, default: "16px" },
    link: { type: String, default: "#" },
  },
 
  
  {
    timestamps: true,
  }
);

const TopBar = mongoose.models.topbar || mongoose.model<ITopBar>('topbar', topBarSchema);

export default TopBar;
