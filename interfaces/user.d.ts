export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phoneNumber:string;
    role: string; 
    isBlocked: boolean;
    isVerified:boolean;
    createdAt: Date;
    updatedAt: Date;
    profile:string;
    location?: {
      type: string;
      coordinates: [number, number];
    };
    ipAddress: string;

  }

