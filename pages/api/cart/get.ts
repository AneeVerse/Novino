import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Cart from '@/models/Cart';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify token and extract user info
    const userInfo = verifyToken(token);
    if (!userInfo || !userInfo.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Connect to database
    await connectToDatabase();
    
    // Find user's cart
    const cart = await Cart.findOne({ userId: userInfo.userId });
    
    // Return empty cart if none found
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    
    return res.status(200).json({ items: cart.items });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ 
      message: 'Error fetching cart',
      error: error.message 
    });
  }
} 