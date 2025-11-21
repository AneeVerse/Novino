import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const supabase = getSupabaseServiceRoleClient();

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Fetch order with related data
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        payment:payments(*)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ order });
  } catch (err: any) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ message: 'Error fetching order' });
  }
}
