export interface IOTP extends mongoose.Document {
    email: string;
    otp: string;
    createdAt: Date;
  }
  