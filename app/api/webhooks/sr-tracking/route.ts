import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Shipment from '@/models/Shipment';
import Order from '@/models/Order';
import { verifyShiprocketWebhook } from '@/lib/services/shiprocket';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-shiprocket-signature') ?? req.headers.get('x-api-key');

  if (!verifyShiprocketWebhook(rawBody, signature)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  await connectToDatabase();

  const shipment = await Shipment.findOne({ shiprocketShipmentId: payload.shipment_id });
  if (!shipment) {
    return NextResponse.json({ ok: true });
  }

  shipment.status = payload.current_status ?? shipment.status;
  shipment.trackingEvents = shipment.trackingEvents || [];
  shipment.trackingEvents.push({
    status: payload.current_status,
    location: payload.current_location,
    remarks: payload.remark,
    recordedAt: payload.updated_at ? new Date(payload.updated_at) : new Date(),
  });
  await shipment.save();

  const order = await Order.findById(shipment.orderId);
  if (order) {
    if (payload.current_status === 'DELIVERED') {
      order.orderStatus = 'delivered';
      order.deliveredAt = new Date();
    } else if (payload.current_status === 'SHIPPED') {
      order.orderStatus = 'shipped';
    } else if (payload.current_status === 'PICKUP SCHEDULED') {
      order.orderStatus = 'processing';
    }

    order.statusTimeline = order.statusTimeline || [];
    order.statusTimeline.push({
      status: (payload.current_status || '').toLowerCase() || 'update',
      note: payload.remark,
      at: payload.updated_at ? new Date(payload.updated_at) : new Date(),
    });
    await order.save();
  }

  return NextResponse.json({ ok: true });
}


