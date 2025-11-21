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

    // Validate request body
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }

    // Add addedAt field to items that don't have it
    const itemsWithTimestamp = items.map((item: any) => ({
      ...item,
      id: item.id, // Preserve original ID type
      addedAt: item.addedAt || new Date().toISOString()
    }));

    // Update or create cart (upsert)
    const { data, error } = await supabase
      .from('carts')
      .upsert(
        {
          user_id: user.id,
          items: itemsWithTimestamp,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase cart update error:', error);
      return res.status(500).json({
        message: 'Error updating cart',
        error: error.message
      });
    }

    return res.status(200).json({
      message: 'Cart updated successfully',
      items: data?.items || []
    });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return res.status(500).json({
      message: 'Error updating cart',
      error: error.message
    });
  }
}