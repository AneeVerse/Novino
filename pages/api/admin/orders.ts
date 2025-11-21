import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServiceRoleClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseServiceRoleClient();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get total count
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get orders with user profiles
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        profile:profiles(username, email)
      `)
      .order('ordered_at', { ascending: false })
      .range(start, end);

    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Error fetching orders' });
    }

    return res.status(200).json({
      orders: orders || [],
      total: count || 0,
      page,
      limit
    });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ message: 'Error fetching orders' });
  }
}
