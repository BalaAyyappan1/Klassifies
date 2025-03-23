import { Schema, Document } from 'mongoose';


export interface IHomePageAds extends Document {
 
  images?: string;


  createdAd: Date;
 
}
