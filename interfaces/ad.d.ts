import { Schema, Document } from 'mongoose';

// Import the Category interfaces
import { CategoryData, MainCategory, Subcategory, Subcategory2 } from './CategoryData';

export interface IAds extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description: string;
  mainCategory: MainCategory; 
  subCategory: Subcategory; 
  subCategory2: Subcategory2;

  images?: string;
  mobile: string;
  address: string;
  city: string;
  pincode: string;
  state: string;

  location?: {
    type: string;
    coordinates: [number, number];
  };

  status:string;
  isBlocked: boolean;
  hideOnDelete: boolean;
  showAllStates: boolean;

  createdAd: Date;
  updatedAd: Date;
}
