import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Cart from '@/models/Cart';
import { verifyPaymentSignature } from '@/lib/services/razorpay';

export async function POST(req: NextRequest) {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = await req.json();

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ message: 'Missing Razorpay payload' }, { status: 400 });
  }

  const isValid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!isValid) {
    return NextResponse.json({ message: 'Signature mismatch' }, { status: 400 });
  }

  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order || order.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  if (order.paymentStatus === 'paid') {
    return NextResponse.json({ order });
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      orderId: order._id,
      userId: order.userId,
      amount: order.total,
      currency: 'INR',
      status: 'paid',
      razorpayOrderId,
      razorpayPaymentId,
      method: paymentMethod,
      capturedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  order.paymentId = payment._id;
  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.statusTimeline = order.statusTimeline || [];
  order.statusTimeline.push({
    status: 'payment_confirmed',
    note: 'Razorpay payment verified',
    at: new Date(),
  });
  await order.save();

  try {
    const orderedProductIds = order.items.map((item: any) => item.productId);
    const cart = await Cart.findOne({ userId: order.userId });
    if (cart) {
      cart.items = cart.items.filter((cartItem: any) => !orderedProductIds.includes(String(cartItem.id)));
      await cart.save();
    }
  } catch (error) {
    console.error('Failed to update cart after payment success:', error);
  }

  return NextResponse.json({ order, payment });
}

