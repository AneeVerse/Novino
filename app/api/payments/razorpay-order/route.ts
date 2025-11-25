import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createRazorpayOrder, getRazorpayPublicKey } from '@/lib/services/razorpay';

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

  const body = await req.json();
  const { items, subtotal, gst, shippingCost = 0, total, deliveryAddress, giftWrap } = body;

  if (!items?.length || !deliveryAddress) {
    return NextResponse.json({ message: 'Missing items or address' }, { status: 400 });
  }

  const { getSupabaseServiceRoleClient } = await import('@/lib/supabase-server');
  const serviceSupabase = getSupabaseServiceRoleClient();

  // Build a map of product IDs -> SKU from product categories
  const productSkuMap = new Map<string, string>();
  try {
    const { data: categories, error: categoriesError } = await serviceSupabase
      .from('product_categories')
      .select('id,name,sku_prefix,products');

    if (categoriesError) {
      console.error('Failed to load categories for SKU enrichment:', categoriesError);
    } else {
      categories?.forEach((category: any) => {
        const defaultPrefix =
          category?.sku_prefix ||
          (category?.name
            ? (category.name as string).replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 8) || 'PRODUCT'
            : 'PRODUCT');

        (category?.products || []).forEach((product: any, index: number) => {
          if (!product) return;
          const productIdVariants = [
            product.id,
            product._id,
            product.productId,
            product.product_id,
          ]
            .filter(Boolean)
            .map((val: any) => String(val));

          const existingSku = typeof product.sku === 'string' && product.sku.trim().length > 0 ? product.sku : null;
          const sequenceSource =
            typeof product.order === 'number'
              ? product.order + 1
              : Number.isFinite(product.order)
              ? Number(product.order) + 1
              : index + 1;
          const sequence = String(sequenceSource).padStart(3, '0');
          const derivedSku = `${defaultPrefix}-${sequence}`;
          const finalSku = existingSku ?? derivedSku;

          productIdVariants.forEach((variantId) => {
            if (!productSkuMap.has(variantId)) {
              productSkuMap.set(variantId, finalSku);
            }
          });
        });
      });
    }
  } catch (error) {
    console.error('Unexpected error while building SKU map:', error);
  }

  const getSkuFromMap = (item: any) => {
    const candidateIds = [
      item?.sku ? null : item?.id,
      item?.productId,
      item?.product_id,
      item?.categoryId,
      item?.category_id,
    ]
      .filter((val) => val !== null && val !== undefined)
      .map((val) => String(val));

    for (const id of candidateIds) {
      const sku = productSkuMap.get(id);
      if (sku) return sku;
    }
    return null;
  };

  const enrichedItems = await Promise.all(
    items.map(async (item: any) => {
      if (item.sku && typeof item.sku === 'string' && item.sku.trim().length > 0) {
        return item;
      }

      const skuFromMap = getSkuFromMap(item);
      if (skuFromMap) {
        return { ...item, sku: skuFromMap };
      }

      // Fallback: try to generate from category prefix (if provided on the item)
      if (item.categoryId) {
        try {
          const { data: category } = await serviceSupabase
            .from('product_categories')
            .select('products, sku_prefix, name')
            .eq('id', item.categoryId)
            .single();

          if (category?.products && Array.isArray(category.products)) {
            const product = category.products.find(
              (p: any) =>
                p.id === item.id ||
                p._id === item.id ||
                p.name === item.name ||
                p.id === item.productId ||
                p._id === item.productId,
            );

            if (product?.sku) {
              return { ...item, sku: product.sku };
            }

            if (category.sku_prefix || category.name) {
              const defaultPrefix =
                category?.sku_prefix ||
                (category?.name
                  ? (category.name as string).replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 8) || 'PRODUCT'
                  : 'PRODUCT');
              const productIndex = category.products.findIndex(
                (p: any) =>
                  p.id === item.id ||
                  p._id === item.id ||
                  p.name === item.name ||
                  p.id === item.productId ||
                  p._id === item.productId,
              );
              const sequence = String((productIndex >= 0 ? productIndex : 0) + 1).padStart(3, '0');
              return { ...item, sku: `${defaultPrefix}-${sequence}` };
            }
          }
        } catch (error) {
          console.error('Error fetching SKU by category for item:', item.id, error);
        }
      }

      // Final fallback: use productId/id
      return { ...item, sku: item.productId || item.id };
    }),
  );

  // Calculate estimated delivery
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  // Create order in Supabase
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      items: enrichedItems,
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
