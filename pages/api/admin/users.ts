import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import Order from '@/models/Order';
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
        // Get all users
        const users = await User.find()
          .select('username email name createdAt')
          .sort({ createdAt: -1 });

        // For each user, get their order count and total spent
        const usersWithStats = await Promise.all(
          users.map(async (user) => {
            const orders = await Order.find({ userId: user._id.toString() });
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
            const lastOrderDate = orders.length > 0 
              ? orders.sort((a, b) => b.orderedAt.getTime() - a.orderedAt.getTime())[0].orderedAt 
              : null;

            return {
              id: user._id,
              username: user.username,
              email: user.email,
              name: user.name,
              createdAt: user.createdAt,
              totalOrders,
              totalSpent,
              lastOrderDate
            };
          })
        );

        return res.status(200).json({ users: usersWithStats });

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in admin users API:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

