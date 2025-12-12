import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';
import { verifyPaymentSignature } from '@/lib/services/razorpay';
import { createShiprocketShipment, scheduleShiprocketPickup } from '@/lib/services/shiprocket';
import { sendOrderConfirmationEmail } from '@/lib/email';

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

  // Calculate dimensions from product category
  let packageDimensions: { length: number; breadth: number; height: number; weight: number } | undefined;
  
  // Fetch all categories once for both dimensions and name resolution
  let allCategories: any[] | null = null;
  try {
    const { data: categories } = await supabase
      .from('product_categories')
      .select('id, name, products, length, width, breadth, height, weight');
    allCategories = categories;
  } catch (error) {
    console.warn('[RazorpayVerify] Failed to fetch categories:', error);
  }
  
  // Helper function to resolve category and product by productId (most reliable) or SKU/name
  const resolveCategoryAndProductForItem = (item: any): { category: any; product: any } | null => {
    if (!allCategories || !Array.isArray(allCategories)) return null;
    
    const productId = item.productId || item.id;
    const productIdStr = productId ? String(productId) : '';
    const itemSku = item.sku ? item.sku.trim().toUpperCase() : '';
    const itemName = item.name ? item.name.trim().toLowerCase() : '';
    
    // First: Try exact productId match (most reliable - same product can't be in multiple categories)
    if (productIdStr) {
      for (const cat of allCategories) {
        if (Array.isArray(cat.products)) {
          const product = cat.products.find((p: any) => {
            const pIdStr = p.id ? String(p.id) : '';
            const pIdStrAlt = p._id ? String(p._id) : '';
            return pIdStr === productIdStr || pIdStrAlt === productIdStr;
          });
          if (product) {
            return { category: cat, product };
          }
        }
      }
    }
    
    // Second: Try SKU match (less reliable - same SKU might exist in multiple categories)
    if (itemSku) {
      for (const cat of allCategories) {
        if (Array.isArray(cat.products)) {
          const product = cat.products.find((p: any) => {
            const pSku = p.sku ? p.sku.trim().toUpperCase() : '';
            return itemSku && pSku && itemSku === pSku;
          });
          if (product) {
            return { category: cat, product };
          }
        }
      }
    }
    
    // Third: Try name match (least reliable)
    if (itemName) {
      for (const cat of allCategories) {
        if (Array.isArray(cat.products)) {
          const product = cat.products.find((p: any) => {
            const pName = p.name ? p.name.trim().toLowerCase() : '';
            return itemName && pName && itemName === pName;
          });
          if (product) {
            return { category: cat, product };
          }
        }
      }
    }
    
    return null;
  };
  
  // Helper to get category only (for backward compatibility)
  const resolveCategoryForItem = (item: any) => {
    const result = resolveCategoryAndProductForItem(item);
    return result?.category || null;
  };
  
  if (order.items && order.items.length > 0) {
    const firstItem = order.items[0];
    const result = resolveCategoryAndProductForItem(firstItem);
    
    if (result) {
      const { category: foundCategory, product: foundProduct } = result;
      
      // PRIORITY 1: Check if product has custom dimensions (packProduct)
      if (foundProduct?.packProduct && foundProduct.length && Number(foundProduct.length) > 0) {
        packageDimensions = {
          length: Number(foundProduct.length),
          breadth: Number(foundProduct.breadth || foundProduct.width || 26),
          height: Number(foundProduct.height || 10),
          weight: Number(foundProduct.weight || 0.5),
        };
        console.log('[RazorpayVerify] Using PRODUCT dimensions (packProduct):', foundProduct.name, packageDimensions);
      }
      // PRIORITY 2: Fall back to category dimensions
      else if (foundCategory && foundCategory.length && Number(foundCategory.length) > 0) {
        packageDimensions = {
          length: Number(foundCategory.length),
          breadth: Number(foundCategory.breadth || foundCategory.width || 26),
          height: Number(foundCategory.height || 10),
          weight: Number(foundCategory.weight || 0.5),
        };
        console.log('[RazorpayVerify] Using category dimensions:', foundCategory.name, packageDimensions);
      }
    }
  }

  // Create Shiprocket shipment
  try {
    console.log('Creating Shiprocket shipment for order:', {
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total,
      itemCount: order.items.length,
      deliveryPincode: order.delivery_address.pincode,
      dimensions: packageDimensions
    });

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
      items: order.items.map((item: any) => {
        // Use the same resolveCategoryForItem function to ensure consistency
        const foundCategory = resolveCategoryForItem(item);
        const categoryName = foundCategory?.name || '';
        
        const design = (item.name || '').toString().trim();
        const combinedName = [design, categoryName].filter(Boolean).join(' ').trim() || design || item.sku || 'Item';
        
        console.log('[RazorpayVerify][ItemName] Building name:', {
          productId: item.productId || item.id,
          sku: item.sku,
          originalName: item.name,
          categoryName: categoryName,
          finalName: combinedName
        });
        
        return {
          name: combinedName,
          sku: item.sku || item.productId || item.id,
          units: item.quantity,
          sellingPrice: item.price,
        };
      }),
      dimensions: packageDimensions,
    });

    console.log('Shiprocket shipment created successfully:', {
      order_id: shipmentResponse.order_id,
      shipment_id: shipmentResponse.shipment_id,
      status: shipmentResponse.status
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
    // CRITICAL ERROR: Shiprocket creation failed
    console.error('❌ SHIPROCKET SHIPMENT CREATION FAILED', {
      environment: process.env.NODE_ENV || 'unknown',
      orderId: order.id,
      orderNumber: order.order_number,
      error: shipmentError.message,
      stack: shipmentError.stack,
      deliveryAddress: {
        name: order.delivery_address.name,
        city: order.delivery_address.city,
        pincode: order.delivery_address.pincode
      },
      timestamp: new Date().toISOString()
    });

    // Add error to status timeline
    statusTimeline.push({
      status: 'processing',
      note: `⚠️ Payment captured but shipment creation failed: ${shipmentError.message}. Support team notified.`,
      at: new Date().toISOString(),
    });

    // Store error in database for tracking
    await supabase.from('shipments').insert({
      order_id: order.id,
      status: 'failed',
      metadata: {
        error: {
          message: shipmentError.message,
          stack: shipmentError.stack,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'unknown'
        },
        tracking_events: [
          {
            status: 'failed',
            remarks: 'Shiprocket shipment creation failed - ' + shipmentError.message,
            recordedAt: new Date().toISOString(),
          },
        ],
      },
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

  // Clear cart - Remove ordered items
  try {
    const orderedProductIds = order.items.map((item: any) =>
      item.productId || item.product_id || item.id || item.categoryId || item.category_id
    ).filter(Boolean);

    const { data: cart } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', order.user_id)
      .single();

    if (cart && cart.items && Array.isArray(cart.items)) {
      const remainingItems = (cart.items as any[]).filter(
        (cartItem: any) => {
          const cartItemId = String(cartItem.id || cartItem.productId || cartItem.product_id || cartItem.categoryId || cartItem.category_id);
          return !orderedProductIds.includes(cartItemId);
        }
      );

      console.log('Clearing cart:', {
        orderedProductIds,
        originalCartCount: cart.items.length,
        remainingCartCount: remainingItems.length
      });

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

  // Send confirmation email
  if (updatedOrder) {
    // Run in background to not block response
    sendOrderConfirmationEmail(updatedOrder).catch((err: any) =>
      console.error('Failed to send order confirmation email:', err)
    );
  }

  return NextResponse.json({ order: updatedOrder, payment });
}
