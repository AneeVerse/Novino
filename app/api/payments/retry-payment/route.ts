import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createRazorpayOrder, getRazorpayPublicKey } from '@/lib/services/razorpay';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const user = session.user;
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID required' }, { status: 400 });
  }

  const serviceSupabase = getSupabaseServiceRoleClient();

  // Fetch the existing order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  // Check if order is eligible for retry (requires_payment or failed)
  if (order.payment_status !== 'requires_payment' && order.payment_status !== 'failed') {
    return NextResponse.json(
      { message: 'Order payment cannot be retried. Current status: ' + order.payment_status },
      { status: 400 }
    );
  }

  // Create new Razorpay order
  const razorpayOrder: any = await createRazorpayOrder({
    amountInPaise: Math.round(order.total * 100),
    receipt: order.order_number ?? order.id,
    notes: { orderId: order.id, userId: user.id, retry: true },
  });

  // Update order with new Razorpay order ID
  const { error: updateError } = await serviceSupabase
    .from('orders')
    .update({
      razorpay_order_id: razorpayOrder.id,
      payment_status: 'requires_payment', // Reset to requires_payment
      status_timeline: [
        ...(order.status_timeline || []),
        {
          status: 'pending',
          note: 'Payment retry initiated',
          at: new Date().toISOString(),
        },
      ],
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order with new Razorpay ID:', updateError);
    return NextResponse.json(
      { message: 'Failed to update order', error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: getRazorpayPublicKey(),
      customer: {
        name: order.delivery_address?.name || user.email?.split('@')[0] || 'Customer',
        email: order.delivery_address?.email || user.email || '',
        contact: order.delivery_address?.phone || '',
      },
    },
    { status: 200 }
  );
}
