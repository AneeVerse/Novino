import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  userId: string;
  gateway: 'razorpay';
  amount: number;
  currency: string;
  status: 'requires_confirmation' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  method?: string;
  capturedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    gateway: { type: String, enum: ['razorpay'], default: 'razorpay' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['requires_confirmation', 'paid', 'failed', 'refunded'],
      default: 'requires_confirmation',
    },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    method: { type: String },
    capturedAt: { type: Date },
    failureReason: { type: String },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

