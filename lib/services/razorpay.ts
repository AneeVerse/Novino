import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!keyId || !keySecret) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.');
}

const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

export async function createRazorpayOrder({
  amountInPaise,
  receipt,
  notes,
}: {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes,
    payment_capture: 1,
  });
}

export function verifyPaymentSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const generated = crypto
    .createHmac('sha256', keySecret!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return generated === razorpaySignature;
}

export function verifyRazorpayWebhook(rawBody: string, signature: string | null) {
  if (!webhookSecret || !signature) return false;
  const digest = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return digest === signature;
}

export function getRazorpayPublicKey() {
  return keyId;
}

