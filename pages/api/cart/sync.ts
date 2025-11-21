import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createPagesServerClient({ req, res });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = session.user;

    // Validate request body - guest cart items from localStorage
    const { guestCartItems } = req.body;
    if (!guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({ message: 'Invalid guest cart data' });
    }

    // Find existing user cart
    const { data: userCart } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    let serverCartItems: any[] = userCart?.items || [];

    // Process guest cart items and merge with server cart
    const mergedItems = [...serverCartItems];
    const now = new Date().toISOString();

    for (const guestItem of guestCartItems) {
      // Normalize IDs for comparison
      const guestItemId = String(guestItem.id).trim();

      // Find if item already exists in server cart (check ID, name, and variant)
      const existingItemIndex = mergedItems.findIndex((item: any) => {
        const itemId = String(item.id).trim();
        const idMatch = itemId === guestItemId;
        const nameMatch = item.name === guestItem.name;
        const variantMatch = (!item.variant && !guestItem.variant) || item.variant === guestItem.variant;

        // Only merge if ALL three match: ID, name, and variant
        return idMatch && nameMatch && variantMatch;
      });

      if (existingItemIndex !== -1) {
        // Update quantity if item exists (same product, same variant)
        mergedItems[existingItemIndex].quantity += guestItem.quantity || 1;
      } else {
        // Add new item with timestamp (different product)
        mergedItems.push({
          ...guestItem,
          id: guestItem.id, // Preserve original ID
          addedAt: guestItem.addedAt || now
        });
      }
    }

    // Update or create cart with merged items (upsert)
    const { data, error } = await supabase
      .from('carts')
      .upsert(
        {
          user_id: user.id,
          items: mergedItems,
          updated_at: now
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase cart sync error:', error);
      return res.status(500).json({
        message: 'Error syncing cart',
        error: error.message
      });
    }

    return res.status(200).json({
      message: 'Cart synced successfully',
      items: data?.items || []
    });
  } catch (error: any) {
    console.error('Error syncing cart:', error);
    return res.status(500).json({
      message: 'Error syncing cart',
      error: error.message
    });
  }
}