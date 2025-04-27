import { Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  subject: 'scam_or_fraud' | 'billing' | 'account' | 'general';
  message: string;
  ad_id?: string;
  status: 'pending' | 'resolved' | 'in_progress';
  createdAt: Date;
  updatedAt: Date;
}