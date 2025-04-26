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

    // Validate request body - guest cart items from localStorage
    const { guestCartItems } = req.body;
    if (!guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({ message: 'Invalid guest cart data' });
    }

    // Connect to database
    await connectToDatabase();
    
    // Find existing user cart
    let userCart = await Cart.findOne({ userId: userInfo.userId });
    let serverCartItems: CartItem[] = userCart?.items || [];
    
    // Process guest cart items and merge with server cart
    const mergedItems = [...serverCartItems];
    const now = new Date();
    
    for (const guestItem of guestCartItems) {
      // Find if item already exists in server cart
      const existingItemIndex = mergedItems.findIndex(item => 
        item.id === guestItem.id && 
        ((!item.variant && !guestItem.variant) || item.variant === guestItem.variant)
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        mergedItems[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Add new item with timestamp
        mergedItems.push({
          ...guestItem,
          addedAt: now
        });
      }
    }
    
    // Update or create cart with merged items
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: userInfo.userId },
      { 
        items: mergedItems,
        updatedAt: now
      },
      { 
        new: true,
        upsert: true
      }
    );
    
    return res.status(200).json({ 
      message: 'Cart synced successfully',
      items: updatedCart.items
    });
  } catch (error: any) {
    console.error('Error syncing cart:', error);
    return res.status(500).json({ 
      message: 'Error syncing cart',
      error: error.message 
    });
  }
} 