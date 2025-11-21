import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';
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

  const supabase = getSupabaseServiceRoleClient();

  // Find payment by razorpay order ID
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('razorpay_order_id', payload.order_id)
    .single();

  if (!payment) {
    return NextResponse.json({ ok: true });
  }

  if (event.event === 'payment.failed') {
    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        metadata: {
          ...payment.metadata,
          failure_reason: payload.error_description,
        },
      })
      .eq('id', payment.id);

    // Update order status
    const { data: order } = await supabase
      .from('orders')
      .select('status_timeline')
      .eq('id', payment.order_id)
      .single();

    if (order) {
      const statusTimeline = [
        ...(order.status_timeline || []),
        {
          status: 'payment_failed',
          note: payload.error_description,
          at: new Date().toISOString(),
        },
      ];

      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status_timeline: statusTimeline,
        })
        .eq('id', payment.order_id);
    }
  }

  return NextResponse.json({ ok: true });
}
