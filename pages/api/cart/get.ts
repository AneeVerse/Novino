import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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

    // Find user's cart in Supabase
    const { data: cart, error } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    // Return empty cart if none found or error
    if (error || !cart) {
      return res.status(200).json({ items: [] });
    }

    return res.status(200).json({ items: cart.items || [] });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      message: 'Error fetching cart',
      error: error.message
    });
  }
}