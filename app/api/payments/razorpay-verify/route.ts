import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';
import { verifyPaymentSignature } from '@/lib/services/razorpay';
import { createShiprocketShipment, scheduleShiprocketPickup } from '@/lib/services/shiprocket';

export async function POST(req: NextRequest) {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = await req.json();

  console.log('Verification request received:', {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    hasSignature: !!razorpaySignature,
  });

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ message: 'Missing Razorpay payload' }, { status: 400 });
  }

  const isValid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!isValid) {
    return NextResponse.json({ message: 'Signature mismatch' }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();

  // Find order - try by ID first (more reliable)
  let order: any = null;
  let orderError: any = null;

  // First, try to find by order ID
  const { data: orderById, error: errorById } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderById && !errorById) {
    order = orderById;
    // Verify razorpay_order_id matches
    if (order.razorpay_order_id && order.razorpay_order_id !== razorpayOrderId) {
      console.error('Order found but razorpay_order_id mismatch:', {
        orderId,
        expected: razorpayOrderId,
        found: order.razorpay_order_id,
      });
      // Try to update the order with the correct razorpay_order_id
      const { data: updatedOrder } = await supabase
        .from('orders')
        .update({ razorpay_order_id: razorpayOrderId })
        .eq('id', orderId)
        .select()
        .single();
      
      if (updatedOrder) {
        order = updatedOrder;
      } else {
        return NextResponse.json(
          { message: 'Order razorpay_order_id mismatch', orderId },
          { status: 400 }
        );
      }
    }
  } else {
    // If not found by ID, try by razorpay_order_id
    const { data: orderByRazorpay, error: errorByRazorpay } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .single();

    if (orderByRazorpay && !errorByRazorpay) {
      order = orderByRazorpay;
      // Verify order ID matches
      if (order.id !== orderId) {
        console.error('Order found by razorpay_order_id but ID mismatch:', {
          expectedOrderId: orderId,
          foundOrderId: order.id,
          razorpayOrderId,
        });
        return NextResponse.json(
          { message: 'Order ID mismatch', expected: orderId, found: order.id },
          { status: 400 }
        );
      }
    } else {
      orderError = errorByRazorpay || errorById;
    }
  }

  if (orderError || !order) {
    console.error('Order lookup failed:', {
      orderId,
      razorpayOrderId,
      error: orderError,
      orderFound: !!order,
      triedById: !!orderById,
      triedByRazorpay: !orderById
    });
    
    // Additional debug: try to list all orders to see what's in the DB
    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, order_number, razorpay_order_id, created_at')
      .limit(10)
      .order('created_at', { ascending: false });
    
    console.error('Recent orders in DB:', allOrders);
    
    return NextResponse.json(
      { 
        message: 'Order not found', 
        details: orderError?.message,
        debug: { orderId, razorpayOrderId }
      },
      { status: 404 }
    );
  }

  if (order.payment_status === 'paid') {
    return NextResponse.json({ order });
  }

  // Create/update payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .upsert({
      order_id: order.id,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      amount: order.total,
      currency: 'INR',
      status: 'captured',
      method: paymentMethod,
    })
    .select()
    .single();

  if (paymentError) {
    console.error('Error creating payment:', paymentError);
  }

  // Update order status
  const statusTimeline = [
    ...(order.status_timeline || []),
    {
      status: 'payment_confirmed',
      note: 'Razorpay payment verified',
      at: new Date().toISOString(),
    },
  ];

  let shipmentId: string | null = null;

  // Create Shiprocket shipment
  try {
    const shipmentResponse = await createShiprocketShipment({
      orderId: order.id,
      orderNumber: order.order_number,
      paymentMethod: 'PREPAID',
      total: order.total,
      deliveryAddress: {
        name: order.delivery_address.name,
        phone: order.delivery_address.phone ?? '',
        email: order.delivery_address.email ?? undefined,
        addressLine1: order.delivery_address.line1,
        addressLine2: order.delivery_address.line2 ?? '',
        city: order.delivery_address.city,
        state: order.delivery_address.state,
        pincode: order.delivery_address.pincode,
        country: 'India',
      },
      items: order.items.map((item: any) => ({
        name: item.name,
        sku: item.productId || item.id,
        units: item.quantity,
        sellingPrice: item.price,
      })),
    });

    // Validate response
    if (!shipmentResponse.order_id || !shipmentResponse.shipment_id) {
      throw new Error(`Shiprocket response missing required fields. Got: ${JSON.stringify(shipmentResponse)}`);
    }

    let pickupResponse: any = null;
    // Schedule pickup if AWB is assigned
    if (shipmentResponse.shipment_id && shipmentResponse.awb_code) {
      try {
        pickupResponse = await scheduleShiprocketPickup(Number(shipmentResponse.shipment_id));
        console.log('Shiprocket pickup scheduled:', pickupResponse);
      } catch (pickupError: any) {
        console.error('Failed to schedule Shiprocket pickup', {
          error: pickupError.message,
          shipment_id: shipmentResponse.shipment_id,
          note: 'Pickup can be scheduled later once AWB is assigned.',
        });
      }
    } else {
      console.log('Shiprocket: Skipping pickup scheduling - AWB not assigned yet.');
    }

    // Create shipment record
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        order_id: order.id,
        shiprocket_order_id: shipmentResponse.order_id?.toString(),
        shiprocket_shipment_id: shipmentResponse.shipment_id?.toString(),
        courier_name: shipmentResponse.courier_company || shipmentResponse.courier_name || null,
        tracking_id: shipmentResponse.awb_code || null,
        tracking_url: shipmentResponse.tracking_url || null,
        status: shipmentResponse.status?.toLowerCase() || 'processing',
        expected_delivery_date: pickupResponse?.pickup_scheduled_date
          ? new Date(pickupResponse.pickup_scheduled_date).toISOString()
          : null,
        metadata: {
          tracking_events: [
            {
              status: 'processing',
              remarks: 'Shipment created in Shiprocket' + (pickupResponse ? ' & pickup scheduled' : ''),
              recordedAt: new Date().toISOString(),
            },
          ],
        },
      })
      .select()
      .single();

    if (!shipmentError && shipment) {
      shipmentId = shipment.id;
      const note = pickupResponse
        ? 'Shipment created & pickup scheduled'
        : 'Shipment created in Shiprocket. Pickup will be scheduled once courier is assigned.';
      statusTimeline.push({
        status: 'processing',
        note,
        at: new Date().toISOString(),
      });
    }
  } catch (shipmentError: any) {
    console.error('Shiprocket shipment creation failed', {
      error: shipmentError.message,
      stack: shipmentError.stack,
    });
    statusTimeline.push({
      status: 'processing',
      note: 'Payment captured but shipment creation failed. Please contact support.',
      at: new Date().toISOString(),
    });
  }

  // Update order with payment info and shipment
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_id: payment?.id || null,
      shipment_id: shipmentId,
      payment_status: 'paid',
      order_status: 'confirmed',
      status_timeline: statusTimeline,
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order:', updateError);
  }

  // Clear cart
  try {
    const orderedProductIds = order.items.map((item: any) => item.productId || item.id);
    const { data: cart } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', order.user_id)
      .single();

    if (cart && cart.items) {
      const remainingItems = (cart.items as any[]).filter(
        (cartItem: any) => !orderedProductIds.includes(String(cartItem.id))
      );
      await supabase
        .from('carts')
        .update({ items: remainingItems })
        .eq('user_id', order.user_id);
    }
  } catch (error) {
    console.error('Failed to update cart after payment success:', error);
  }

  // Fetch updated order
  const { data: updatedOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  return NextResponse.json({ order: updatedOrder, payment });
}
