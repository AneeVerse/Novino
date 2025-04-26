import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  purpose: 'signup' | 'login' | 'reset';
  expires: Date;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required']
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'reset'],
    required: [true, 'Purpose is required']
  },
  expires: {
    type: Date,
    required: [true, 'Expiry time is required'],
    default: function() {
      return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Auto-delete document after 5 minutes (300 seconds)
  }
});

// Create an index to make TTL work
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

// Check if the model is already defined to prevent overwrite during hot reloads
const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP; 