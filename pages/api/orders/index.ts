import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = session.user;

    switch (req.method) {
      case 'GET':
        // Get all orders for the authenticated user
        const { data: orders, error: getError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('ordered_at', { ascending: false }); // Most recent first

        if (getError) {
          console.error('Error fetching orders:', getError);
          return res.status(500).json({ message: 'Error fetching orders' });
        }

        return res.status(200).json({ orders: orders || [] });

      case 'POST':
        // Create new order
        const {
          items,
          subtotal,
          gst,
          shippingCost,
          total,
          deliveryAddress,
          paymentMethod,
          giftWrap,
          razorpayOrderId
        } = req.body;

        // Validate required fields
        if (!items || items.length === 0) {
          return res.status(400).json({ message: 'No items in order' });
        }

        if (!deliveryAddress) {
          return res.status(400).json({ message: 'Delivery address required' });
        }

        if (!paymentMethod) {
          return res.status(400).json({ message: 'Payment method required' });
        }

        // Calculate estimated delivery (3-5 business days)
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

        // Create order
        const { data: newOrder, error: createError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            items: items,
            subtotal: subtotal || 0,
            gst: gst || 0,
            shipping_cost: shippingCost || 0,
            total: total || 0,
            delivery_address: deliveryAddress,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'pending' : 'requires_payment',
            order_status: 'confirmed',
            gift_wrap: giftWrap || false,
            estimated_delivery: estimatedDelivery.toISOString(),
            razorpay_order_id: razorpayOrderId || null,
            status_timeline: [
              {
                status: 'confirmed',
                note: 'Order confirmed',
                at: new Date().toISOString()
              }
            ]
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating order:', createError);
          return res.status(500).json({ message: 'Error creating order', error: createError.message });
        }

        // Remove ordered items from cart
        try {
          const orderedProductIds = items.map((item: any) => item.productId || item.id);

          // Get current cart
          const { data: cart } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .single();

          if (cart && cart.items) {
            // Filter out the ordered items
            const remainingItems = (cart.items as any[]).filter((cartItem: any) => {
              return !orderedProductIds.includes(String(cartItem.id));
            });

            // Update cart with remaining items
            await supabase
              .from('carts')
              .update({ items: remainingItems })
              .eq('user_id', user.id);
          }
        } catch (error) {
          console.error('Error updating cart:', error);
          // Don't fail the order if cart update fails
        }

        return res.status(201).json({
          message: 'Order placed successfully',
          order: newOrder
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in orders API:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}
