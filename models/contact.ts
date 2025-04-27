import { IContact } from '../interfaces/contact';
import mongoose, { Schema } from 'mongoose';

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      validate: {
        validator: (value: string) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please enter a valid email address"
      }
    },
    subject: {
      type: String,
      enum: ["scam_or_fraud", "billing", "account", "general"],
      required: [true, "Subject is required"],
      default: "scam_or_fraud"
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [20, "Message must be at least 20 characters"],
      maxlength: [1000, "Message cannot exceed 1000 characters"]
    },
    ad_id: {
      type: String,
      required: function() {
        return this.subject === 'scam_or_fraud';
      }
    },

    status: {
      type: String,
      enum: ["pending", "resolved", "in_progress"],
      default: "pending"
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        delete ret.ipAddress;
        return ret;
      }
    }
  }
);

// Add text index for search functionality
contactSchema.index({ 
  name: 'text', 
  email: 'text', 
  message: 'text',
  ad_id: 'text'
});

const Contact = mongoose.models?.Contact || mongoose.model<IContact>('Contact', contactSchema);

export default Contact;