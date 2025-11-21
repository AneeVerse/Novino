import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';
import { verifyShiprocketWebhook } from '@/lib/services/shiprocket';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-shiprocket-signature') ?? req.headers.get('x-api-key');

  if (!verifyShiprocketWebhook(rawBody, signature)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const supabase = getSupabaseServiceRoleClient();

  // Find shipment by Shiprocket shipment ID
  const { data: shipment } = await supabase
    .from('shipments')
    .select('*')
    .eq('shiprocket_shipment_id', payload.shipment_id?.toString())
    .single();

  if (!shipment) {
    return NextResponse.json({ ok: true });
  }

  // Update shipment status and tracking events
  const trackingEvents = [
    ...(shipment.metadata?.tracking_events || []),
    {
      status: payload.current_status,
      location: payload.current_location,
      remarks: payload.remark,
      recordedAt: payload.updated_at ? new Date(payload.updated_at).toISOString() : new Date().toISOString(),
    },
  ];

  await supabase
    .from('shipments')
    .update({
      status: payload.current_status?.toLowerCase() || shipment.status,
      metadata: {
        ...shipment.metadata,
        tracking_events: trackingEvents,
      },
    })
    .eq('id', shipment.id);

  // Update order status based on shipment status
  const { data: order } = await supabase
    .from('orders')
    .select('status_timeline')
    .eq('id', shipment.order_id)
    .single();

  if (order) {
    let orderStatus = order.order_status;
    let deliveredAt = null;

    if (payload.current_status === 'DELIVERED') {
      orderStatus = 'delivered';
      deliveredAt = new Date().toISOString();
    } else if (payload.current_status === 'SHIPPED') {
      orderStatus = 'shipped';
    } else if (payload.current_status === 'PICKUP SCHEDULED') {
      orderStatus = 'processing';
    }

    const statusTimeline = [
      ...(order.status_timeline || []),
      {
        status: (payload.current_status || '').toLowerCase() || 'update',
        note: payload.remark,
        at: payload.updated_at ? new Date(payload.updated_at).toISOString() : new Date().toISOString(),
      },
    ];

    const updateData: any = {
      order_status: orderStatus,
      status_timeline: statusTimeline,
    };

    if (deliveredAt) {
      updateData.delivered_at = deliveredAt;
    }

    await supabase
      .from('orders')
      .update(updateData)
      .eq('id', shipment.order_id);
  }

  return NextResponse.json({ ok: true });
}
