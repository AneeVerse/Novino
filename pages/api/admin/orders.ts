import type { NextApiRequest, NextApiResponse } from 'next';
import Order from '@/models/Order';
import User from '@/models/User';
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

    // Check if user is admin (you can add isAdmin field to User model)
    // For now, we'll just allow all authenticated users to access
    // TODO: Add proper admin role check

    // Connect to database
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        const { userId } = req.query;

        if (userId) {
          // Get orders for a specific user
          const orders = await Order.find({ userId: userId as string })
            .sort({ orderedAt: -1 });

          // Get user details
          const user = await User.findById(userId).select('username email name');

          return res.status(200).json({ 
            orders,
            user: user ? {
              id: user._id,
              username: user.username,
              email: user.email,
              name: user.name
            } : null
          });
        } else {
          // Get all orders with user information
          const orders = await Order.find()
            .sort({ orderedAt: -1 })
            .limit(100); // Limit to recent 100 orders

          // Get unique user IDs
          const userIds = [...new Set(orders.map(order => order.userId))];

          // Fetch user details for all users
          const users = await User.find({ _id: { $in: userIds } })
            .select('username email name');

          // Create a map of userId to user details
          const userMap = new Map(
            users.map(user => [
              user._id.toString(),
              {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name
              }
            ])
          );

          // Combine orders with user details
          const ordersWithUsers = orders.map(order => ({
            ...order.toObject(),
            user: userMap.get(order.userId) || null
          }));

          // Get order statistics
          const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
            pendingOrders: orders.filter(o => o.orderStatus === 'pending').length,
            confirmedOrders: orders.filter(o => o.orderStatus === 'confirmed').length,
            processingOrders: orders.filter(o => o.orderStatus === 'processing').length,
            shippedOrders: orders.filter(o => o.orderStatus === 'shipped').length,
            deliveredOrders: orders.filter(o => o.orderStatus === 'delivered').length,
            cancelledOrders: orders.filter(o => o.orderStatus === 'cancelled').length,
            codOrders: orders.filter(o => o.paymentMethod === 'cod').length,
            onlineOrders: orders.filter(o => o.paymentMethod !== 'cod').length,
          };

          return res.status(200).json({ 
            orders: ordersWithUsers,
            stats
          });
        }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in admin orders API:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

