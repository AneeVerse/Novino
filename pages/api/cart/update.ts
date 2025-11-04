import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Cart from '@/models/Cart';
import { CartItem } from '@/models/Cart';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from cookies using getTokenFromReq
    const { getTokenFromReq } = await import('@/lib/auth');
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify token and extract user info
    const userInfo = verifyToken(token);
    if (!userInfo || !userInfo.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Validate request body
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }

    // Connect to database
    await connectToDatabase();
    
    // Add addedAt field to items that don't have it and ensure IDs are preserved
    const itemsWithTimestamp = items.map((item: CartItem) => ({
      ...item,
      id: item.id, // Preserve original ID type (string or number)
      addedAt: item.addedAt || new Date()
    }));

    // Update or create cart
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: userInfo.userId },
      { 
        items: itemsWithTimestamp,
        updatedAt: new Date()
      },
      { 
        new: true, // Return updated document
        upsert: true // Create if doesn't exist
      }
    );
    
    return res.status(200).json({ 
      message: 'Cart updated successfully',
      items: updatedCart.items
    });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ 
      message: 'Error updating cart',
      error: error.message 
    });
  }
} 