import type { NextApiRequest, NextApiResponse } from 'next';
import Order from '@/models/Order';
import connectToDatabase from '@/lib/db';
import { getTokenFromReq, verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

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

    const { id } = req.query;

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Find order and verify ownership
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== userInfo.userId) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    switch (req.method) {
      case 'GET':
        // Get single order details
        return res.status(200).json({ order });

      case 'PATCH':
        // Cancel order (only if not shipped/delivered)
        if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
          return res.status(400).json({ 
            message: 'Cannot cancel order that has been shipped or delivered' 
          });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        return res.status(200).json({
          message: 'Order cancelled successfully',
          order
        });

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in order API:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

