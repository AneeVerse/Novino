import mongoose, { Schema, Document } from 'mongoose';

// Define Cart Item interface
export interface CartItem {
  id: string | number;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
  variant?: string;
  addedAt: Date;
}

// Define Cart document interface
export interface CartDocument extends Document {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

// Create Cart schema
const CartSchema = new Schema<CartDocument>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [{
    id: {
      type: Schema.Types.Mixed,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Schema.Types.Mixed,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    variant: {
      type: String,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Cart model or use existing one
const Cart = mongoose.models.Cart || mongoose.model<CartDocument>('Cart', CartSchema);

export default Cart; 