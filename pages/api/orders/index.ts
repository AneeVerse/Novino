import type { NextApiRequest, NextApiResponse } from 'next';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import connectToDatabase from '@/lib/db';
import { getTokenFromReq, verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let userInfo;
    try {
      userInfo = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!userInfo || !userInfo.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Connect to database
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        // Get all orders for the authenticated user
        const orders = await Order.find({ userId: userInfo.userId })
          .sort({ orderedAt: -1 }); // Most recent first

        return res.status(200).json({ orders });

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
          giftWrap
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
        const newOrder = await Order.create({
          userId: userInfo.userId,
          items,
          subtotal: subtotal || 0,
          gst: gst || 0,
          shippingCost: shippingCost || 0,
          total: total || 0,
          deliveryAddress,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          orderStatus: 'confirmed',
          giftWrap: giftWrap || false,
          estimatedDelivery
        });

        // Remove only the ordered items from cart
        try {
          const orderedProductIds = items.map((item: any) => item.productId);
          
          // Get current cart
          const cart = await Cart.findOne({ userId: userInfo.userId });
          
          if (cart) {
            // Filter out the ordered items
            cart.items = cart.items.filter((cartItem: any) => {
              return !orderedProductIds.includes(String(cartItem.id));
            });
            
            // Save the updated cart
            await cart.save();
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

