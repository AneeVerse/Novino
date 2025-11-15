import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import { verifyRazorpayWebhook } from '@/lib/services/razorpay';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!verifyRazorpayWebhook(rawBody, signature)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const payload = event.payload?.payment?.entity;
  if (!payload) {
    return NextResponse.json({ ok: true });
  }

  await connectToDatabase();

  const payment = await Payment.findOne({ razorpayOrderId: payload.order_id });
  if (!payment) {
    return NextResponse.json({ ok: true });
  }

  if (event.event === 'payment.failed') {
    payment.status = 'failed';
    payment.failureReason = payload.error_description;
    await payment.save();

    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = 'failed';
      order.statusTimeline = order.statusTimeline || [];
      order.statusTimeline.push({
        status: 'payment_failed',
        note: payload.error_description,
        at: new Date(),
      });
      await order.save();
    }
  }

  return NextResponse.json({ ok: true });
}

