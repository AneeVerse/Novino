import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Cart from '@/models/Cart';
import Shipment from '@/models/Shipment';
import { verifyPaymentSignature } from '@/lib/services/razorpay';
import { createShiprocketShipment, scheduleShiprocketPickup } from '@/lib/services/shiprocket';

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

  try {
    const shipmentResponse = await createShiprocketShipment({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      paymentMethod: 'PREPAID',
      total: order.total,
      deliveryAddress: {
        name: order.deliveryAddress.name,
        phone: order.deliveryAddress.phone ?? '',
        email: order.deliveryAddress.email ?? undefined,
        addressLine1: order.deliveryAddress.line1,
        addressLine2: order.deliveryAddress.line2 ?? '',
        city: order.deliveryAddress.city,
        state: order.deliveryAddress.state,
        pincode: order.deliveryAddress.pincode,
        country: 'India',
      },
      items: order.items.map((item: any) => ({
        name: item.name,
        sku: item.productId,
        units: item.quantity,
        sellingPrice: item.price,
      })),
    });

    // Validate response has required fields
    if (!shipmentResponse.order_id || !shipmentResponse.shipment_id) {
      throw new Error(`Shiprocket response missing required fields. Got: ${JSON.stringify(shipmentResponse)}`);
    }

    let pickupResponse: any = null;
    // Only try to schedule pickup if AWB is already assigned
    // If order is in "NEW" status, AWB hasn't been assigned yet and pickup scheduling will fail
    if (shipmentResponse.shipment_id && shipmentResponse.awb_code) {
      try {
        pickupResponse = await scheduleShiprocketPickup(Number(shipmentResponse.shipment_id));
        console.log('Shiprocket pickup scheduled:', pickupResponse);
      } catch (pickupError: any) {
        console.error('Failed to schedule Shiprocket pickup', {
          error: pickupError.message,
          shipment_id: shipmentResponse.shipment_id,
          note: 'Pickup can be scheduled later once AWB is assigned. This is normal for NEW orders.',
        });
        // Don't throw - pickup can be scheduled later once AWB is assigned
      }
    } else {
      console.log('Shiprocket: Skipping pickup scheduling - AWB not assigned yet (status: NEW). Pickup will be scheduled once courier is assigned.');
    }

    const shipment = await Shipment.create({
      orderId: order._id,
      userId: order.userId,
      shiprocketOrderId: shipmentResponse.order_id,
      shiprocketShipmentId: shipmentResponse.shipment_id,
      courierName: shipmentResponse.courier_company || shipmentResponse.courier_name || undefined,
      awbCode: shipmentResponse.awb_code || undefined,
      trackingUrl: shipmentResponse.tracking_url || undefined,
      status: shipmentResponse.status?.toLowerCase() || 'processing',
      pickupScheduledFor: pickupResponse?.pickup_scheduled_date
        ? new Date(pickupResponse.pickup_scheduled_date)
        : undefined,
      trackingEvents: [
        {
          status: 'processing',
          remarks: 'Shipment created in Shiprocket' + (pickupResponse ? ' & pickup scheduled' : ' (pickup will be scheduled once AWB is assigned)'),
          recordedAt: new Date(),
        },
      ],
    });

    order.shipmentId = shipment._id;
    const note = pickupResponse 
      ? 'Shipment created & pickup scheduled' 
      : 'Shipment created in Shiprocket. Pickup will be scheduled once courier is assigned.';
    order.statusTimeline.push({
      status: 'processing',
      note,
      at: new Date(),
    });
  } catch (shipmentError: any) {
    console.error('Shiprocket shipment creation failed', {
      error: shipmentError.message,
      stack: shipmentError.stack,
      response: shipmentError.response || 'No response',
    });
    order.statusTimeline.push({
      status: 'processing',
      note: 'Payment captured but shipment creation failed. Please contact support.',
      at: new Date(),
    });
  }
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

