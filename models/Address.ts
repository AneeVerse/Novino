import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress extends Document {
  userId: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true // For faster queries
  },
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  line1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true
  },
  line2: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one default address per user
AddressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Remove default flag from other addresses of this user
    await mongoose.models.Address.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Check if the model is already defined to prevent overwrite during hot reloads
const Address: Model<IAddress> = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);

export default Address;

