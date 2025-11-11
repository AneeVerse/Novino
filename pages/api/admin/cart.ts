import type { NextApiRequest, NextApiResponse } from 'next';
import Cart from '@/models/Cart';
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
          // Get cart for specific user
          const cart = await Cart.findOne({ userId: userId as string });
          
          // Get user details
          const user = await User.findById(userId).select('username email name');

          return res.status(200).json({ 
            cart: cart || { items: [] },
            user: user ? {
              id: user._id,
              username: user.username,
              email: user.email,
              name: user.name
            } : null
          });
        } else {
          // Get all carts with user information
          const carts = await Cart.find();

          // Get unique user IDs
          const userIds = carts.map(cart => cart.userId);

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

          // Combine carts with user details
          const cartsWithUsers = carts.map(cart => ({
            userId: cart.userId,
            items: cart.items,
            itemCount: cart.items.length,
            totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            user: userMap.get(cart.userId) || null,
            updatedAt: cart.updatedAt
          }));

          // Filter out empty carts
          const activeCartsWithUsers = cartsWithUsers.filter(c => c.itemCount > 0);

          return res.status(200).json({ 
            carts: activeCartsWithUsers
          });
        }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in admin cart API:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

