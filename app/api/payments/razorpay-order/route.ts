import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createRazorpayOrder, getRazorpayPublicKey } from '@/lib/services/razorpay';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const user = session.user;

  const body = await req.json();
  const { items, subtotal, gst, shippingCost = 0, total, deliveryAddress, giftWrap } = body;

  if (!items?.length || !deliveryAddress) {
    return NextResponse.json({ message: 'Missing items or address' }, { status: 400 });
  }

  // Calculate estimated delivery
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  // Create order in Supabase
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      items,
      subtotal,
      gst,
      shipping_cost: shippingCost,
      total,
      delivery_address: {
        ...deliveryAddress,
        phone: deliveryAddress.phone ?? '',
        email: user.email,
      },
      payment_method: 'razorpay',
      payment_status: 'requires_payment',
      order_status: 'pending',
      gift_wrap: !!giftWrap,
      estimated_delivery: estimatedDelivery.toISOString(),
      status_timeline: [{ status: 'pending', note: 'Awaiting Razorpay payment', at: new Date().toISOString() }],
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Error creating order:', orderError);
    return NextResponse.json({ message: 'Error creating order' }, { status: 500 });
  }

  // Create Razorpay order
  const razorpayOrder: any = await createRazorpayOrder({
    amountInPaise: Math.round(total * 100),
    receipt: order.order_number ?? order.id,
    notes: { orderId: order.id, userId: user.id },
  });

  // Update order with Razorpay order ID - CRITICAL: Must complete before returning
  // Use service role client for update to bypass RLS if needed
  const { getSupabaseServiceRoleClient } = await import('@/lib/supabase-server');
  const serviceSupabase = getSupabaseServiceRoleClient();
  
  const { data: updatedOrder, error: updateError } = await serviceSupabase
    .from('orders')
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq('id', order.id)
    .select()
    .single();

  if (updateError || !updatedOrder) {
    console.error('Error updating order with Razorpay ID:', {
      error: updateError,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      orderExists: !!order
    });
    // Return error - order was created but razorpay ID update failed
    return NextResponse.json(
      { 
        message: 'Order created but Razorpay ID update failed', 
        orderId: order.id,
        error: updateError?.message 
      },
      { status: 500 }
    );
  }

  console.log('Order created successfully:', {
    orderId: order.id,
    orderNumber: order.order_number,
    razorpayOrderId: razorpayOrder.id,
  });

  return NextResponse.json(
    {
      orderId: order.id,
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
