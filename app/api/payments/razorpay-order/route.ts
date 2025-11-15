import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { createRazorpayOrder, getRazorpayPublicKey } from '@/lib/services/razorpay';

export async function POST(req: NextRequest) {
  const token = cookies().get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  let user;
  try {
    user = verifyToken(token);
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const body = await req.json();
  const { items, subtotal, gst, shippingCost = 0, total, deliveryAddress, giftWrap } = body;

  if (!items?.length || !deliveryAddress) {
    return NextResponse.json({ message: 'Missing items or address' }, { status: 400 });
  }

  await connectToDatabase();

  const order = await Order.create({
    userId: user.userId,
    items,
    subtotal,
    gst,
    shippingCost,
    total,
    deliveryAddress,
    paymentMethod: 'razorpay',
    paymentStatus: 'requires_payment',
    orderStatus: 'pending',
    giftWrap: !!giftWrap,
    statusTimeline: [{ status: 'pending', note: 'Awaiting Razorpay payment', at: new Date() }],
  });

  const razorpayOrder = await createRazorpayOrder({
    amountInPaise: Math.round(total * 100),
    receipt: order.orderNumber ?? order._id.toString(),
    notes: { orderId: order._id.toString(), userId: user.userId },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return NextResponse.json(
    {
      orderId: order._id.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: getRazorpayPublicKey(),
      customer: {
        name: deliveryAddress.name,
        email: user.email,
        contact: deliveryAddress.phone ?? '',
      },
    },
    { status: 201 }
  );
}

